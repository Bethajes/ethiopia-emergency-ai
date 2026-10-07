from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.config import get_settings
from app.db.session import get_db
from app.schemas.health import HealthResponse

router = APIRouter(tags=["system"])


def _postgis_version(session: Session) -> str | None:
    version = session.execute(text("SELECT PostGIS_Version()")).scalar_one_or_none()
    return str(version) if version else None


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service and database health",
)
def health_check(session: Session = Depends(get_db)) -> HealthResponse:
    settings = get_settings()
    database = "down"
    postgis_version: str | None = None
    try:
        postgis_version = _postgis_version(session)
        database = "up"
    except SQLAlchemyError:
        database = "down"

    return HealthResponse(
        status="ok" if database == "up" else "degraded",
        service=settings.app_name,
        environment=settings.environment,
        database=database,
        postgis_version=postgis_version,
        timestamp=datetime.now(UTC),
    )