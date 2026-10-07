#!/usr/bin/env bash
# Apply database migrations against a running stack.
# Usage: ./scripts/migrate.sh
set -euo pipefail

cd "$(dirname "$0")/.."

docker compose run --rm backend alembic upgrade head