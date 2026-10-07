#!/usr/bin/env bash
# Start the full stack (PostGIS + API + frontend) with Docker Compose.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "No .env found; copying .env.example"
  cp .env.example .env
  echo "Review .env before exposing anything beyond localhost."
fi

docker compose up --build "$@"