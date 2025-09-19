#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

POSTGRES_HOST=${DB_HOST:-localhost}
POSTGRES_PORT=${DB_PORT:-5432}
POSTGRES_DB=${DB_NAME:-houston_ej_ai}
POSTGRES_USER=${DB_USER:-houston}
POSTGRES_PASSWORD=${DB_PASSWORD:-ej_ai_2024}
REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}

export PGPASSWORD="$POSTGRES_PASSWORD"

printf "Waiting for PostgreSQL %s:%s...\n" "$POSTGRES_HOST" "$POSTGRES_PORT"
for _ in $(seq 1 30); do
  if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$POSTGRES_DB" -U "$POSTGRES_USER" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$POSTGRES_DB" -U "$POSTGRES_USER" >/dev/null 2>&1; then
  echo "PostgreSQL not reachable after 30 seconds" >&2
  exit 1
fi

echo "PostgreSQL is ready"

printf "Waiting for Redis %s:%s...\n" "$REDIS_HOST" "$REDIS_PORT"
for _ in $(seq 1 30); do
  if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
  echo "Redis not reachable after 30 seconds" >&2
  exit 1
fi

echo "Redis is ready"

cd node-server
exec node src/server.js
