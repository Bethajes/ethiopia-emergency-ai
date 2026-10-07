from typing import TYPE_CHECKING

from geoalchemy2 import Geography
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
from app.models.base import CreatedAtMixin, LATITUDE_CHECK, LONGITUDE_CHECK

if TYPE_CHECKING:
    from app.models.disaster_event import DisasterEvent


class EmergencyReport(Base, CreatedAtMixin):
    __tablename__ = "emergency_reports"
    __table_args__ = (
        LATITUDE_CHECK,
        LONGITUDE_CHECK,
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_id: Mapped[int | None] = mapped_column(
        ForeignKey("disaster_events.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Reports may arrive before an event is confirmed",
    )
    source: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    report_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False,
        comment="PostGIS point mirroring latitude/longitude for spatial queries",
    )

    severity: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    event: Mapped["DisasterEvent | None"] = relationship(back_populates="reports")

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<EmergencyReport id={self.id} source={self.source} verified={self.verified}>"