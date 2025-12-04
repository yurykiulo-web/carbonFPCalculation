#!/bin/bash

# Start the backend in the background
echo "Starting backend..."
server-python/.venv/bin/uvicorn server-python.main:app --reload --port 8000 --app-dir . &
BACKEND_PID=$!

# Function to kill the backend process
kill_backend() {
  echo "Stopping backend..."
  kill $BACKEND_PID
}

# Trap the exit signal to kill the backend process
trap kill_backend EXIT

# Start the client in the foreground
echo "Starting client..."
npm run dev:client
