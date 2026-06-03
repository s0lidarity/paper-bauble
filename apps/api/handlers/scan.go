package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/otiai10/gosseract/v2"
)

type ScanResponse struct {
	RawText    string `json:"raw_text"`
	Confidence int    `json:"confidence"`
	Status     string `json:"status"`
}

const maxUploadSize = 5 << 20 // 5MB

func ScanHandler(w http.ResponseWriter, r *http.Request) {
	// Add CORS headers so the mobile app can communicate with the API
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight OPTIONS request
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Limit the size of the request body to prevent abuse
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)

	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		http.Error(w, "File too large: "+err.Error(), http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Invalid file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer func() {
		if err := file.Close(); err != nil {
			log.Printf("Warning: error closing uploaded file: %v", err)
		}
	}()

	// Ensure the tmp directory exists
	if err := os.MkdirAll("tmp", 0755); err != nil {
		log.Printf("Failed to create tmp directory: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create a temporary file within the tmp directory
	dst, err := os.CreateTemp("tmp", "scan-*.jpg")
	if err != nil {
		log.Printf("Failed to create temp file: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Clean up the file from disk once the handler finishes
	defer func() {
		if err := os.Remove(dst.Name()); err != nil {
			log.Printf("Warning: error removing temp file %s: %v", dst.Name(), err)
		}
	}()

	// Copy the uploaded file to the destination file
	if _, err := io.Copy(dst, file); err != nil {
		_ = dst.Close()
		log.Printf("Failed to save image: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// Close the file explicitly before Tesseract tries to read it
	if err := dst.Close(); err != nil {
		log.Printf("Failed to close temp file: %v", err)
	}

	client := gosseract.NewClient()
	defer func() {
		_ = client.Close()
	}()

	// Point Tesseract to the file we just saved
	if err := client.SetImage(dst.Name()); err != nil {
		log.Printf("OCR Error (SetImage): %v", err)
		http.Error(w, "Failed to process image", http.StatusInternalServerError)
		return
	}

	text, err := client.Text()
	if err != nil {
		log.Printf("OCR Error (GetText): %v", err)
		http.Error(w, "Failed to extract text", http.StatusInternalServerError)
		return
	}

	conf := 0 // Placeholder: MeanTextConf requires gosseract v2.4.0+

	response := ScanResponse{
		RawText:    text,
		Confidence: conf,
		Status:     "success",
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode scan response: %v", err)
	}
}
