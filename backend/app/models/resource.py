from geoalchemy2 import Geography
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base
from app.models.base import LATITUDE_CHECK, LONGITUDE_CHECK, TimestampMixin
from app.models.enums import ResourceStatus


class Resource(Base, TimestampMixin):
    """Response asset tracked for allocation against disaster events."""

    __tablename__ = "resources"
    __table_args__ = (
        LATITUDE_CHECK,
        LONGITUDE_CHECK,
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    resource_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[object] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=True),
        nullable=False,
        comment="PostGIS point mirroring latitude/longitude for spatial queries",
    )

    status: Mapped[str] = mapped_column(
        String(16), nullable=False, default=ResourceStatus.available.value, index=True
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<Resource id={self.id} type={self.resource_type} status={self.status}>"