#!/bin/sh
set -e

java -jar java-services/*.jar &
JAVA_PID=$!

cleanup() {
  kill "$JAVA_PID" 2>/dev/null || true
}
trap cleanup INT TERM

cd node-server
exec node src/server.js

