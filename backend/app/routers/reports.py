from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import ReportSource, ReportType
from app.schemas.emergency_report import EmergencyReportCreate, EmergencyReportRead
from app.schemas.error import ErrorResponse
from app.services.events import DisasterEventService
from app.services.reports import EmergencyReportService

router = APIRouter(prefix="/reports", tags=["emergency reports"])


@router.get(
    "",
    response_model=list[EmergencyReportRead],
    summary="List emergency reports",
)
def list_reports(
    event_id: int | None = Query(default=None, ge=1),
    source: ReportSource | None = Query(default=None),
    report_type: ReportType | None = Query(default=None),
    verified: bool | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_db),
) -> list[EmergencyReportRead]:
    service = EmergencyReportService(session)
    return service.list(
        event_id=event_id,
        source=source,
        report_type=report_type,
        verified=verified,
        limit=limit,
        offset=offset,
    )


@router.post(
    "",
    response_model=EmergencyReportRead,
    status_code=status.HTTP_201_CREATED,
    responses={422: {"model": ErrorResponse}},
    summary="Submit an emergency report",
)
def create_report(
    payload: EmergencyReportCreate, session: Session = Depends(get_db)
) -> EmergencyReportRead:
    # A bad event_id must not surface as a foreign-key database error.
    if payload.event_id is not None and not DisasterEventService(session).exists(payload.event_id):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Disaster event {payload.event_id} does not exist",
        )
    return EmergencyReportService(session).create(payload)