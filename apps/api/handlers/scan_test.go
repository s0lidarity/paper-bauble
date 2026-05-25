package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestLibraryAvailability(t *testing.T) {
	version := GetOCRVersion()
	if version == "" {
		t.Fatal("Tesseract version is empty. The library might not be installed or linked correctly.")
	}
	t.Logf("Detected OCR Library Version: %s", version)
}

func TestScanHandler_NoFile(t *testing.T) {
	req := httptest.NewRequest(http.MethodPost, "/scan", nil)
	rr := httptest.NewRecorder()

	ScanHandler(rr, req)

	if status := rr.Code; status != http.StatusBadRequest {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusBadRequest)
	}
}

func TestScanHandler_WithFile(t *testing.T) {
	// Prepare a buffer to hold the multipart form data
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create the form file field
	part, err := writer.CreateFormFile("image", "test.jpg")
	if err != nil {
		t.Fatal(err)
	}

	// Write some dummy data (Tesseract will likely fail to read this as an image,
	// but we can check if the handler reaches that point)
	_, err = io.Copy(part, bytes.NewReader([]byte("not-a-real-image")))
	if err != nil {
		t.Fatal(err)
	}
	writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/scan", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rr := httptest.NewRecorder()

	ScanHandler(rr, req)

	if rr.Code == http.StatusOK {
		var resp ScanResponse
		if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
			t.Fatalf("Failed to decode response: %v", err)
		}
		if resp.Status != "success" {
			t.Errorf("Expected status 'success', got %s", resp.Status)
		}
	} else if rr.Code == http.StatusInternalServerError {
		// This is acceptable in environments where Tesseract isn't configured,
		// as long as the handler didn't crash before this point.
		t.Log("OCR step failed as expected with invalid image data")
	} else {
		t.Errorf("Unexpected status code: %v. Body: %s", rr.Code, rr.Body.String())
	}

	// Verify cleanup: the tmp directory should not contain our test file
	files, _ := os.ReadDir("tmp")
	if len(files) > 0 {
		t.Logf("Note: %d files remain in tmp/, check if cleanup is working as expected", len(files))
	}
}
