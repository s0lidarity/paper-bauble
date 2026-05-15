package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthCheckHandler(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/health", nil)

	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	// Initialize the handler with a nil DB for simple routing tests
	handler := HealthCheckHandler(nil)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code, got: \n%v \nwanted:\n %v", status, http.StatusOK)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}

	if resp["status"] != "ok" {
		t.Errorf("handler returned unexpected status: got %v wanted %v", resp["status"], "ok")
	}
}
