#!/usr/bin/env bash
# End-to-end smoke test for the Step 1 foundation.
# Usage: ./scripts/smoke_test.sh [API_BASE_URL]
set -euo pipefail

API_BASE_URL="${1:-${API_BASE_URL:-http://localhost:8001}}"
PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == *"$expected"* ]]; then
    printf '  PASS  %s\n' "$name"
    PASS=$((PASS + 1))
  else
    printf '  FAIL  %s (expected %s, got %s)\n' "$name" "$expected" "$actual"
    FAIL=$((FAIL + 1))
  fi
}

status_of() {
  curl -s -o /dev/null -w '%{http_code}' "$@"
}

body_of() {
  curl -s "$@"
}

printf 'NileShield AI smoke test against %s\n\n' "$API_BASE_URL"

printf 'health\n'
check "GET /api/health returns ok" '"status":"ok"' "$(body_of "$API_BASE_URL/api/health")"
check "GET /api/health reports database up" '"database":"up"' "$(body_of "$API_BASE_URL/api/health")"
check "GET /api/health reports postgis" '"postgis_version"' "$(body_of "$API_BASE_URL/api/health")"

printf '\nevents\n'
check "GET /api/events is 200" "200" "$(status_of "$API_BASE_URL/api/events")"
check "GET /api/events returns a list" "[" "$(body_of "$API_BASE_URL/api/events")"
check "GET /api/events/1 missing is 404" "404" "$(status_of "$API_BASE_URL/api/events/1")"

printf '\nreports\n'
REPORT_JSON=$(cat <<'JSON'
{
  "source": "field_team",
  "report_type": "flood",
  "description": "Smoke-test report inserted by scripts/smoke_test.sh",
  "latitude": 9.0192,
  "longitude": 38.7525,
  "severity": "medium",
  "confidence": 0.25
}
JSON
)
CREATE_RESPONSE=$(curl -s -w '\n%{http_code}' \
  -X POST "$API_BASE_URL/api/reports" \
  -H 'Content-Type: application/json' \
  -d "$REPORT_JSON")
check "POST /api/reports creates a report" '"id"' "$CREATE_RESPONSE"
check "POST /api/reports returns 201" "201" "$(printf '%s' "$CREATE_RESPONSE" | tail -n1)"
check "GET /api/reports lists the report" 'Smoke-test report' "$(body_of "$API_BASE_URL/api/reports")"

INVALID_JSON='{"source":"citizen","report_type":"flood","description":"bad","latitude":999,"longitude":38,"severity":"medium"}'
check "POST /api/reports rejects bad latitude" "422" \
  "$(status_of -X POST "$API_BASE_URL/api/reports" -H 'Content-Type: application/json' -d "$INVALID_JSON")"

printf '\nresources\n'
check "GET /api/resources is 200" "200" "$(status_of "$API_BASE_URL/api/resources")"
check "GET /api/resources returns a list" "[" "$(body_of "$API_BASE_URL/api/resources")"

printf '\nfrontend\n'
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
check "Frontend serves the app shell" "NileShield AI" "$(body_of "$FRONTEND_URL")"

printf '\n%d passed, %d failed\n' "$PASS" "$FAIL"
[[ "$FAIL" -eq 0 ]]