# Architecture — NileShield AI

## What exists today (Step 1)

```
┌──────────────┐    /api (proxied)    ┌──────────────┐    SQLAlchemy    ┌────────────────────┐
│  frontend    │ ──────────────────► │   backend    │ ───────────────► │  PostgreSQL 16     │
│  React + TS  │                     │   FastAPI    │                  │  + PostGIS 3.4     │
│  MapLibre GL │ ◄────────────────── │  /api/*      │ ◄─────────────── │  disaster_events   │
└──────────────┘   JSON envelopes    └──────────────┘                  │  emergency_reports │
                                                                  │  resources         │
                                                                  └────────────────────┘
```

- `frontend` — React + TypeScript (strict) + Vite + Tailwind + React Router,
  with a single reusable MapLibre component.
- `backend` — FastAPI application split into `routers / schemas / services /
  models / db`. Routers validate and serialise; services own all database
  logic; models define the PostGIS-aware schema; Alembic owns migrations.
- `db` — PostgreSQL with PostGIS. Every geo record carries `latitude`,
  `longitude` and a `geography(Point, 4326)` column with a GiST index, so
  radius and containment queries are available immediately.

The database ships empty. No synthetic events, reports or resources are seeded,
so nothing on screen can be mistaken for real intelligence output.

## Target architecture (Step 2+)

Every signal source is processed independently and then fused:

```
Satellite imagery ──► satellite processing / ML ──► flood detection ─────┐
Weather data ───────► weather analysis ─────────► flood risk ──────────┤
Emergency reports ──► NLP + geolocation ────────► incident intelligence├─► EVIDENCE FUSION
Drone imagery ──────► computer vision ─────────► damage detection ─────┘        ENGINE
```

The **evidence fusion engine** is the single decision point. It consumes signal
observations (each with its own confidence and provenance) and produces:

- disaster probability
- severity
- confidence
- affected area (polygon)
- affected infrastructure
- people potentially affected
- blocked roads
- recommended response priorities

### How the current foundation supports that

| Future need | Foundation already in place |
|---|---|
| Event probability / severity / confidence | `disaster_events.confidence`, `severity`, `status` columns |
| Affected area polygon | `geography` columns already used for points; the same type supports `POLYGON` |
| Blocked roads, infrastructure | `resources` table plus planned geo layers under `data/geo/` |
| Provenance of every signal | `emergency_reports.source` + optional `event_id` foreign key |
| Serving fused output to the UI | `GET /api/events` and the declarative map layer contract |

## Data model relationships

```
disaster_events 1 ──── * emergency_reports   (ON DELETE SET NULL)
resources                (independent; joined by geography in later phases)
```

Reports may arrive before an event is confirmed, which is why `event_id` is
nullable: automated detection and human reporting are separate signals that
later converge.

## Extending the API

1. Add a migration in `backend/alembic/versions/`.
2. Add or extend a model in `backend/app/models/`.
3. Add a schema in `backend/app/schemas/` (the frontend mirrors these in
   `frontend/src/api/types.ts`).
4. Put query logic in `backend/app/services/`.
5. Expose it from a router in `backend/app/routers/`.