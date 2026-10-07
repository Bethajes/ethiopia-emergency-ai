# infrastructure/ — NileShield AI

Local and production infrastructure definitions. **Step 1 runs entirely on
Docker Compose**; nothing here is provisioned yet.

## Running now

```bash
docker compose up --build
```

That starts three services: `db` (PostgreSQL 16 + PostGIS 3.4), `backend`
(FastAPI on port 8001), and `frontend` (Vite dev server on port 5173).

## Planned (Step 3+)

- Terraform or equivalent IaC for cloud environments.
- Managed PostgreSQL with PostGIS, private networking, automated backups.
- Object storage (raw/derived imagery) with lifecycle rules.
- Object storage bucket + queue for async ingestion (satellite, drone, weather).
- Container registry and a deployment pipeline for the API and web apps.
- Observability: structured logs, metrics for ingestion lag and pipeline health.

No infrastructure is created by this directory yet, by design.