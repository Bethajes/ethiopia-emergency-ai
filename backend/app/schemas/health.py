from datetime import datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Payload for GET /api/health."""

    status: str = Field(description="ok when the API and database are both reachable")
    service: str
    environment: str
    database: str = Field(description="up | down")
    postgis_version: str | None = None
    timestamp: datetime