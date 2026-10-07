# NileShield AI

**AI-powered disaster intelligence for Africa.**

NileShield AI is an emergency-response platform that fuses satellite imagery,
weather data, drone imagery, emergency reports and other signals into a single
operational picture, so responders can understand what is happening and where
to send resources first.

This repository is **Step 1 — the project foundation**: a working monorepo with
a FastAPI + PostGIS backend, a React + MapLibre operations console, Docker
Compose infrastructure and documented setup. The intelligence pipeline is
deliberately not implemented yet; nothing in this codebase returns fabricated
predictions or sample disaster data.

---

## 1. Project purpose

Emergency responders in Ethiopia and across Africa currently depend on
disjoint, manual sources: satellite imagery nobody has time to inspect, weather
forecasts that are not translated into flood risk, and reports arriving over
radio and messaging apps. This platform is the layer that turns those signals
into decisions:

- detect floods, landslides, storms and other events from imagery and weather
- extract structured incidents from free-text emergency reports
- fuse every signal into one confidence-weighted picture per event
- expose affected area, affected people, blocked roads and response priorities

The console is an **operations tool, not a marketing site**. Every screen is
built for responders under time pressure.

---

## 2. Architecture overview

```
┌──────────────┐    /api (proxied)    ┌──────────────┐     SQLAlchemy    ┌──────────────────┐
│  frontend    │ ──────────────────► │   backend    │ ────────────────► │  PostgreSQL 16   │
│  React + TS  │                     │   FastAPI    │                   │  + PostGIS 3.4   │
│  MapLibre GL │ ◄────────────────── │  /api/*      │ ◄──────────────── │  disaster_events │
└──────────────┘    JSON envelopes   └──────────────┘                   │  emergency_reports│
                                                                     │  resources       │
                                                                     └──────────────────┘
```

Backend layering is strict: `routers` (HTTP) → `schemas` (validation) →
`services` (business logic) → `models` (ORM/PostGIS) → `db` (session). Alembic
owns schema changes.

Target pipeline (Step 2+, **not implemented**):

```
Satellite imagery ──► satellite processing / ML ──► flood detection ─────┐
Weather data ───────► weather analysis ─────────► flood risk ──────────┤
Emergency reports ──► NLP + geolocation ────────► incident intelligence ├─► EVIDENCE FUSION
Drone imagery ──────► computer vision ─────────► damage detection ─────┘        ENGINE
```

The evidence fusion engine will output disaster probability, severity,
confidence, affected area, affected infrastructure, people potentially
affected, blocked roads and recommended response priorities. See
[docs/architecture.md](docs/architecture.md) for how today's schema already
accommodates those outputs.

---

## 3. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript (strict), Vite 5, Tailwind CSS 3, React Router 6, MapLibre GL JS 4 |
| Backend | Python 3.12, FastAPI, Pydantic v2, Pydantic Settings, SQLAlchemy 2.0, GeoAlchemy2, Alembic, Uvicorn |
| Database | PostgreSQL 16 with PostGIS 3.4 |
| Infrastructure | Docker, Docker Compose, Git |
| ML (planned) | PyTorch, OpenCV, GeoPandas, Rasterio, Shapely |

---

## 4. Directory structure

```
nileshield-ai/
├── frontend/                  React + TypeScript operations console
│   ├── src/
│   │   ├── api/               Typed API service layer (client, types, resources)
│   │   ├── components/
│   │   │   ├── layout/        AppShell, Header, Sidebar
│   │   │   ├── map/           MapCanvas (MapLibre), basemap style, GeoJSON helpers
│   │   │   ├── events/        EventPanel, EventList
│   │   │   ├── ui/            Panel, Badge, States
│   │   │   └── StatusIndicator.tsx
│   │   ├── lib/               Constants, formatters, data-loading hook
│   │   ├── pages/             Dashboard, Events, EventDetail, Reports, Resources
│   │   └── styles/            Tailwind entry point + MapLibre theme
│   └── Dockerfile
├── backend/                   FastAPI service
│   ├── alembic/               Migration environment and versions
│   ├── app/
│   │   ├── config.py          Environment-driven settings
│   │   ├── errors.py          Error envelope and exception handlers
│   │   ├── main.py            App factory, CORS, lifespan
│   │   ├── db/                Engine, session, geospatial helpers
│   │   ├── models/            SQLAlchemy models + domain enums
│   │   ├── schemas/           Pydantic request/response contracts
│   │   ├── routers/           health, events, reports, resources
│   │   └── services/          Database logic
│   ├── tests/                 Integration tests against the live database
│   ├── Dockerfile
│   └── entrypoint.sh
├── ml/                        Reserved for ML packages (see ml/README.md)
├── data/                      raw / interim / geo working directories
├── infrastructure/            Local + future cloud infrastructure notes
├── docs/                      architecture.md, api.md
├── scripts/                   dev.sh, migrate.sh, smoke_test.sh
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 5. Local setup

Requirements: Docker with Compose v2 (recommended), or Node 18+ and Python 3.12+
with a local PostgreSQL 16 + PostGIS instance.

```bash
git clone <repository-url>
cd nileshield-ai
cp .env.example .env
```

Edit `.env` and set `POSTGRES_PASSWORD`. No secret is ever committed; `.env` is
git-ignored.

---

## 6. Docker setup

```bash
docker compose up --build
```

| Service | URL / port |
|---|---|
| Frontend (Vite dev server) | http://localhost:5173 |
| Backend API | http://localhost:8001 |
| API docs (Swagger UI) | http://localhost:8001/api/docs |
| PostgreSQL + PostGIS | `localhost:5435` (host) → `5432` (container) |

The database port is published on **5435** because 5432–5434 are commonly taken
by local PostgreSQL installs; change `POSTGRES_PORT` if needed.

The backend container runs `alembic upgrade head` before starting Uvicorn, so
the schema and the PostGIS extension are created on first boot. Startup order is
guarded by a `pg_isready` healthcheck on the database.

Stop the stack with `docker compose down`. Add `-v` to also delete the database
volume.

---

## 7. Environment variables

All configuration comes from environment variables; `.env.example` documents
every value. Secrets are never hardcoded.

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection string | `postgresql+psycopg://nileshield:nileshield@db:5432/nileshield` |
| `API_BASE_URL` | Public URL of the backend | `http://localhost:8001` |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Database credentials | `nileshield` |
| `POSTGRES_PORT` | Published database port | `5435` |
| `BACKEND_PORT` / `FRONTEND_PORT` | Published service ports | `8001` / `5173` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Optional absolute API URL for the browser | empty → dev proxy |
| `ENVIRONMENT` / `DEBUG` | Runtime mode; `DEBUG=true` exposes error detail | `development` |

---

## 8. Running the frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle in dist/
npm run typecheck    # strict TypeScript check
```

The dev server proxies `/api` to `VITE_DEV_API_TARGET` (default
`http://localhost:8001`, set to `http://backend:8001` inside Docker), so the
browser only ever talks to one origin and CORS stays simple.

---

## 9. Running the backend

With Docker:

```bash
docker compose up --build backend
```

Without Docker (virtualenv):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
export DATABASE_URL="postgresql+psycopg://nileshield:nileshield@localhost:5435/nileshield"
alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

Run the tests (they use `DATABASE_URL`):

```bash
docker compose exec backend pytest
```

> The suite truncates `disaster_events`, `emergency_reports` and `resources`
> around every test. Point `DATABASE_URL` at a scratch database before running
> it against anything you care about.

Verify the whole stack end to end:

```bash
./scripts/smoke_test.sh
```

---

## 10. Connecting to PostgreSQL / PostGIS

```bash
docker compose exec db psql -U nileshield -d nileshield
```

```sql
\dx                                  -- postgis must be listed
SELECT PostGIS_Version();

SELECT id, event_type, severity, ST_AsText(location) FROM disaster_events;

-- Geometry-ready example for the pipeline phases:
SELECT id, title
FROM disaster_events
WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(38.7525, 9.0192), 4326)::geography,
    25000
);
```

From the host, connect on port 5435 with the credentials in `.env`. Each table
stores `latitude`/`longitude` for simple reads plus a
`geography(Point, 4326)` column with a GiST index, which is what future
flood-zone polygons and containment queries will build on.

---

## 11. Current functionality

**Backend**

- `GET /api/health` — service status, database connectivity, PostGIS version
- `GET /api/events` — list events with `event_type`, `status`, `severity`,
  `limit`, `offset` filters
- `GET /api/events/{event_id}` — single event, `404` error envelope when absent
- `POST /api/events` — register an event (operator entry / test support)
- `POST /api/reports` — submit an emergency report (`201`)
- `GET /api/reports` — list reports with `event_id`, `source`, `report_type`,
  `verified` filters
- `GET /api/resources` — list resources with `resource_type`, `status` filters
- CORS from environment, uniform error envelope, Alembic migrations, PostGIS
  extension and spatial indexes

**Frontend**

- Operations shell: header with UTC clock and live system-status indicator,
  sidebar navigation, responsive content area
- Routes: `/`, `/events`, `/events/:id`, `/reports`, `/resources`
- Dashboard: situation map, live counts from the database, resource picture,
  event register, and an explicit "planned, not implemented" pipeline panel
- Reports page: filterable log table with verification state
- Resources page: filterable register with availability totals
- Reusable `MapCanvas` (MapLibre GL) centred on Ethiopia with a declarative
  layer contract: GeoJSON points, lines and polygons can be registered without
  touching map internals
- Basemap: OpenStreetMap raster tiles, keyless so local development and CI need
  no provider account. Darkening is applied with raster paint properties, so
  alert markers keep their colours. OSM's tile policy covers light development
  use only — replace `frontend/src/components/map/mapStyle.ts` with a hosted
  provider style (MapTiler, Protomaps, OpenFreeMap) before deploying, and no
  other code needs to change.
- Typed API service layer — no `fetch` calls inside components

**Database**

| Table | Key columns |
|---|---|
| `disaster_events` | `id`, `event_type`, `title`, `description`, `severity`, `confidence`, `status`, `latitude`, `longitude`, `location` (geography), `created_at`, `updated_at` |
| `emergency_reports` | `id`, `event_id` (FK, nullable), `source`, `report_type`, `description`, `latitude`, `longitude`, `location` (geography), `severity`, `confidence`, `verified`, `created_at` |
| `resources` | `id`, `resource_type`, `name`, `quantity`, `latitude`, `longitude`, `location` (geography), `status`, `created_at`, `updated_at` |

Latitude/longitude ranges are enforced by database check constraints; `location`
is kept in sync by the service layer.

---

## 12. Planned future phases

| Phase | Scope |
|---|---|
| Step 2 | Satellite ingestion and flood detection over Ethiopia; raster pipeline in `ml/satellite/` |
| Step 3 | Weather data ingestion and flood-risk modelling |
| Step 4 | Emergency-report NLP: classification, geolocation extraction, deduplication, verification workflow |
| Step 5 | Drone imagery upload and computer-vision damage assessment |
| Step 6 | Evidence fusion engine producing probability, severity, confidence, affected area and affected population |
| Step 7 | Response prioritization and resource allocation against available assets |
| Step 8 | Cloud infrastructure, authentication, alerting and real-time event streaming |

---

## Principles

- No fabricated data. The database starts empty and every empty state says so.
- No fake intelligence. Model outputs appear only when real models exist.
- No hardcoded secrets. Configuration is environment-driven.
- No unnecessary dependencies. Each package earns its place.
- Extensible by contract: the schema, API and map layer interfaces are designed
  so new signals can be added without reworking what exists.