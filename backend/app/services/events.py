from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.db.geo import point_geography
from app.models.disaster_event import DisasterEvent
from app.models.enums import EventStatus, EventType, Severity
from app.schemas.disaster_event import DisasterEventCreate


class DisasterEventService:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list(
        self,
        *,
        event_type: EventType | None = None,
        status: EventStatus | None = None,
        severity: Severity | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[DisasterEvent]:
        stmt: Select[tuple[DisasterEvent]] = select(DisasterEvent)
        if event_type is not None:
            stmt = stmt.where(DisasterEvent.event_type == event_type.value)
        if status is not None:
            stmt = stmt.where(DisasterEvent.status == status.value)
        if severity is not None:
            stmt = stmt.where(DisasterEvent.severity == severity.value)

        stmt = (
            stmt.order_by(DisasterEvent.created_at.desc(), DisasterEvent.id.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(self._session.scalars(stmt).all())

    def get(self, event_id: int) -> DisasterEvent | None:
        return self._session.get(DisasterEvent, event_id)

    def exists(self, event_id: int) -> bool:
        return (
            self._session.execute(
                select(DisasterEvent.id).where(DisasterEvent.id == event_id)
            ).first()
            is not None
        )

    def create(self, payload: DisasterEventCreate) -> DisasterEvent:
        event = DisasterEvent(
            **payload.model_dump(mode="json", exclude={"latitude", "longitude"}),
            location=point_geography(payload.latitude, payload.longitude),
            latitude=payload.latitude,
            longitude=payload.longitude,
        )
        self._session.add(event)
        self._session.commit()
        self._session.refresh(event)
        return event