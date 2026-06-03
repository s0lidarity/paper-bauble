package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/otiai10/gosseract/v2"
)

func GetOCRVersion() string {
	return gosseract.Version()
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

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
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

		if err := json.NewEncoder(w).Encode(map[string]interface{}{
			"status": "ok",
			"db":     dbStatus,
			"libs": map[string]string{
				"tesseract": GetOCRVersion(),
				"gosseract": "v2",
			},
			"env": os.Getenv("RENDER_SERVICE_NAME"),
		}); err != nil {
			log.Printf("Failed to encode health response: %v", err)
		}
	}
}
