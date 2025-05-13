#!/bin/sh
set -e

SERVER_URL="${SERVER_URL:-http://server:3000}"
MAX_ATTEMPTS=60
RETRY_INTERVAL=5

echo "Waiting for server to be ready at ${SERVER_URL}/ping..."
attempt=0

while [ $attempt -lt $MAX_ATTEMPTS ]; do
  attempt=$((attempt + 1))
  
  if wget --spider --quiet "${SERVER_URL}/ping" 2>/dev/null; then
    echo "Server is ready! Starting tests..."
    exec "$@"
    exit 0
  fi
  
  echo "Attempt ${attempt}/${MAX_ATTEMPTS} - Server not ready yet. Retrying in ${RETRY_INTERVAL} seconds..."
  sleep $RETRY_INTERVAL
done

echo "Server failed to become ready after ${MAX_ATTEMPTS} attempts."
exit 1