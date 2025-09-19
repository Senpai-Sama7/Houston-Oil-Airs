#!/usr/bin/env bash
set -euo pipefail

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-houston_ej_ai}
DB_USER=${DB_USER:-houston}
DB_PASSWORD=${DB_PASSWORD:-ej_ai_2024}
CSV_PATH=${CSV_PATH:-$(pwd)/data/air_quality_data.csv}

if [ ! -f "$CSV_PATH" ]; then
  echo "Air quality CSV not found at $CSV_PATH" >&2
  exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER" -v ON_ERROR_STOP=1 -f database/schema.sql

psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER" -v ON_ERROR_STOP=1 <<SQL
CREATE TEMP TABLE air_quality_stage (
    timestamp_ms BIGINT,
    pm25 REAL,
    pm10 REAL,
    temperature REAL,
    humidity REAL,
    device_id TEXT,
    health_events INTEGER
);

\copy air_quality_stage FROM '${CSV_PATH}' WITH (FORMAT csv, HEADER true);

INSERT INTO air_quality (time, device_id, pm25, pm10, temperature, humidity, health_events, signature, encrypted)
SELECT
    to_timestamp(timestamp_ms / 1000.0),
    device_id,
    pm25,
    pm10,
    temperature,
    humidity,
    COALESCE(health_events, 0),
    CASE
        WHEN to_regproc('pgcrypto.digest(bytea,text)') IS NOT NULL THEN
            encode(digest((device_id || timestamp_ms)::bytea, 'sha256'), 'hex')
        ELSE
            md5(device_id || timestamp_ms::text)
    END,
    TRUE
FROM air_quality_stage
ON CONFLICT (time, device_id) DO NOTHING;
SQL

unset PGPASSWORD

echo "Database bootstrap complete for $DB_NAME on $DB_HOST:$DB_PORT"
