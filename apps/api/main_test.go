package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthCheckHandler(t *testing.T) {
	req, err := http.NewRequest("Get", "/health", nil)

	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()

	handler := http.HandlerFunc(HealthCheckHandler)

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: \ngot %v \nwanted %v", status, http.StatusOK)
	}

	expected := `{"status":"ok"}` + "\n"
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: \ngot %v \nwanted %v", rr.Body.String(), expected)
	}
}
