#!/bin/sh
# Container entrypoint: apply database migrations, then serve the API.
# Override with: docker compose run --rm backend alembic upgrade head
set -e

echo "Applying database migrations..."
attempt=1
until alembic upgrade head; do
  if [ "$attempt" -ge 10 ]; then
    echo "Database still unavailable after ${attempt} attempts" >&2
    exit 1
  fi
  echo "Migration attempt ${attempt} failed; retrying in 3s..."
  attempt=$((attempt + 1))
  sleep 3
done

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

echo "Starting API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload