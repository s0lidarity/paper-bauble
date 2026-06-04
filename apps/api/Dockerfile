# Stage 1: Build
FROM golang:1.25-alpine AS builder

RUN apk add --no-cache build-base tesseract-ocr-dev leptonica-dev opencv-dev

WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./main.go

# Stage 2: Run
FROM alpine:latest

RUN apk add --no-cache tesseract-ocr opencv ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]