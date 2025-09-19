#!/bin/sh
set -e

java -jar java-services/*.jar &
JAVA_PID=$!

cleanup() {
  echo "Shutting down Java service (PID: $JAVA_PID)..."
  kill "$JAVA_PID" 2>/dev/null || true
  wait "$JAVA_PID" 2>/dev/null
  echo "Java service shut down."
}
trap cleanup INT TERM

cd node-server
exec node src/server.js

