package main

import (
	"context"
	"database/sql"
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

//go:embed db/migrations/*.sql
var migrationFS embed.FS

func runMigrations(db *sql.DB) error {
	driver, err := pgx.WithInstance(db, &pgx.Config{})
	if err != nil {
		return err
	}

	// Strip the "db/migrations" prefix from the embedded FS
	sub, err := fs.Sub(migrationFS, "db/migrations")
	if err != nil {
		return err
	}

	source, err := iofs.New(sub, ".")
	if err != nil {
		return err
	}
	m, err := migrate.NewWithInstance("iofs", source, "pgx", driver)
	if err != nil {
		return err
	}

	if err = m.Up(); err != nil && err != migrate.ErrNoChange {
		return err
	}

	return nil

}

func HealthCheckHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[%s] Health check request from %s", r.Method, r.RemoteAddr)

		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Use a timeout for the DB ping to prevent hanging
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()

		dbStatus := "connected"
		if db == nil {
			dbStatus = "disconnected: database connection is nil"
		} else {
			if err := db.PingContext(ctx); err != nil {
				dbStatus = fmt.Sprintf("disconnected: %v", err)
			}
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		if err := json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
			"db":     dbStatus,
			"env":    os.Getenv("FLY_APP_NAME"), // Helps confirm we are in prod
		}); err != nil {
			fmt.Printf("Error encoding health check response: %s\n", err)
		}
	}
}

func main() {
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Error opening database connection: %s\n", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Printf("Error closing database connection: %v\n", err)
		}
	}()

	// Run DB check and migrations in the background so the server can start immediately
	go func() {
		if err := db.Ping(); err != nil {
			log.Printf("Warning: Could not connect to Neon on startup: %v\n", err)
		} else {
			if err := runMigrations(db); err != nil {
				log.Printf("Warning: Error running migrations: %s\n", err)
			} else {
				fmt.Println("Connected to Neon Postgres successfully and migrations applied!")
			}
		}
	}()

	http.HandleFunc("/health", HealthCheckHandler(db))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := fmt.Sprintf("0.0.0.0:%s", port)
	fmt.Println("Listening on", addr)
	fmt.Printf("Starting paper Bauble API on %s...\n", addr)

	err = http.ListenAndServe(addr, nil)
	log.Fatal(err)
}
