#!/bin/sh

# Start Java service in background
java -jar java-services/*.jar &

# Start Node.js service
cd node-server && node src/server.js