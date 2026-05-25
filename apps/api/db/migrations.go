package db

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
)

//go:embed migrations/*.sql
var migrationFS embed.FS

func RunMigrations(db *sql.DB) error {
	if db == nil {
		return fmt.Errorf("database connection is nil")
	}

	driver, err := pgx.WithInstance(db, &pgx.Config{})
	if err != nil {
		return err
	}

	// Strip the "migrations" prefix since we are inside the db package
	sub, err := fs.Sub(migrationFS, "migrations")
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
