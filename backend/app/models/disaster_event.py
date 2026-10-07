from typing import TYPE_CHECKING

from geoalchemy2 import Geography
from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import (
    LATITUDE_CHECK,
    LONGITUDE_CHECK,
    TimestampMixin,
)
from app.models.enums import EventStatus

if TYPE_CHECKING:
    from app.models.emergency_report import EmergencyReport


class DisasterEvent(Base, TimestampMixin):
    __tablename__ = "disaster_events"
    __table_args__ = (
        LATITUDE_CHECK,
        LONGITUDE_CHECK,
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(
        Float, nullable=False, default=0.0, comment="0.0-1.0, set by the evidence fusion engine"
    )
    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default=EventStatus.active.value, index=True
    )

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False,
        comment="PostGIS point mirroring latitude/longitude for spatial queries",
    )

    reports: Mapped[list["EmergencyReport"]] = relationship(
        back_populates="event", cascade="all, delete-orphan", passive_deletes=True
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<DisasterEvent id={self.id} type={self.event_type} status={self.status}>"