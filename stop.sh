#!/bin/bash

echo "Stopping app containers..."
docker stop movie-db-frontend-1 movie-db-backend-1 2>/dev/null || true
docker rm movie-db-frontend-1 movie-db-backend-1 2>/dev/null || true

echo "Stopping Jenkins..."
docker stop jenkins

echo "Everything stopped."
