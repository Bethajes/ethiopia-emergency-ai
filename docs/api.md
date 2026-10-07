# API reference — NileShield AI

Base URL in development: `http://localhost:8001` (all routes are prefixed with
`/api`).

Interactive docs: `http://localhost:8001/api/docs` · OpenAPI schema:
`http://localhost:8001/api/openapi.json`

## Error format

Every error response uses the same envelope:

```json
{
  "error": {
    "code": "not_found",
    "message": "Disaster event 999 not found",
    "detail": "request.body.latitude: Input should be less than or equal to 90"
  }
}
```

| Status | `code` |
|---|---|
| 404 | `not_found` |
| 405 | `method_not_allowed` |
| 422 | `validation_error` |
| 500 | `internal_error` (detail only when `DEBUG=true`) |
| 503 | `database_error` (detail only when `DEBUG=true`) |

## Endpoints

### GET /api/health

Service and database health.

```json
{
  "status": "ok",
  "service": "NileShield AI",
  "environment": "development",
  "database": "up",
  "postgis_version": "POSTGIS_3_4...",
  "timestamp": "2026-01-01T00:00:00Z"
}
```

`status` is `ok` when the database answers, otherwise `degraded`.

### GET /api/events

List disaster events, newest first.

| Query param | Type | Default |
|---|---|---|
| `event_type` | `flood` \| `landslide` \| `earthquake` \| `storm` \| `wildfire` \| `drought` \| `other` | — |
| `status` | `active` \| `monitoring` \| `contained` \| `resolved` | — |
| `severity` | `low` \| `medium` \| `high` \| `critical` | — |
| `limit` | int 1–200 | 50 |
| `offset` | int ≥ 0 | 0 |

Response: array of disaster events.

### GET /api/events/{event_id}

Single event. `404` with the error envelope when it does not exist.

### POST /api/events

Registers an event. Provided for operator entry and for tests; automated
detection writes through services in later phases.

```json
{
  "event_type": "flood",
  "title": "Blue Nile flooding, Bahir Dar",
  "description": "Optional free text",
  "severity": "high",
  "confidence": 0.0,
  "status": "active",
  "latitude": 11.5936,
  "longitude": 37.3908
}
```

Returns `201` with the created record.

### POST /api/reports

Submits an emergency report. `event_id` is optional: reports can arrive before
an event is confirmed.

```json
{
  "event_id": null,
  "source": "field_team",
  "report_type": "flood",
  "description": "Water rising near the river bank",
  "latitude": 9.0192,
  "longitude": 38.7525,
  "severity": "medium",
  "confidence": 0.25,
  "verified": false
}
```

`source`: `citizen`, `field_team`, `sensor`, `social_media`, `satellite`,
`drone`, `other`.
`report_type`: `flood`, `landslide`, `earthquake`, `storm`, `wildfire`,
`infrastructure_damage`, `medical_emergency`, `other`.

Returns `201` with the created record.

### GET /api/reports

| Query param | Type |
|---|---|
| `event_id` | int |
| `source` | report source enum |
| `report_type` | report type enum |
| `verified` | boolean |
| `limit` / `offset` | int / int |

### GET /api/resources

| Query param | Type |
|---|---|
| `resource_type` | `medical`, `water`, `food`, `shelter`, `personnel`, `vehicle`, `equipment` |
| `status` | `available`, `deployed`, `depleted` |
| `limit` / `offset` | int / int |

## Not implemented yet

No endpoints exist for satellite imagery, weather, drone processing, social
media ingestion, evidence fusion, resource allocation, authentication or
websocket streaming. These are planned, not stubbed.