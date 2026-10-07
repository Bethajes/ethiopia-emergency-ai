from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import EventStatus, EventType, Severity
from app.schemas.disaster_event import DisasterEventCreate, DisasterEventRead
from app.schemas.error import ErrorResponse
from app.services.events import DisasterEventService

router = APIRouter(prefix="/events", tags=["disaster events"])


@router.get(
    "",
    response_model=list[DisasterEventRead],
    summary="List disaster events",
)
def list_events(
    event_type: EventType | None = Query(default=None),
    status_filter: EventStatus | None = Query(default=None, alias="status"),
    severity: Severity | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_db),
) -> list[DisasterEventRead]:
    service = DisasterEventService(session)
    return service.list(
        event_type=event_type,
        status=status_filter,
        severity=severity,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/{event_id}",
    response_model=DisasterEventRead,
    responses={404: {"model": ErrorResponse}},
    summary="Retrieve a single disaster event",
)
def get_event(event_id: int, session: Session = Depends(get_db)) -> DisasterEventRead:
    event = DisasterEventService(session).get(event_id)
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Disaster event {event_id} not found",
        )
    return event


@router.post(
    "",
    response_model=DisasterEventRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a disaster event",
)
def create_event(
    payload: DisasterEventCreate, session: Session = Depends(get_db)
) -> DisasterEventRead:
    return DisasterEventService(session).create(payload)