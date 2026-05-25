package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/s0lidarity/paper-bauble/api/handlers"
)

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
			if err := db_pkg.RunMigrations(db); err != nil {
				log.Printf("Warning: Error running migrations: %s\n", err)
			} else {
				fmt.Println("Connected to Neon Postgres successfully and migrations applied!")
			}
		}
	}()

	http.HandleFunc("/health", handlers.HealthCheckHandler(db))
	http.HandleFunc("/scan", handlers.ScanHandler)

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
