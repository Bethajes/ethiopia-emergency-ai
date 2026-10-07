from datetime import datetime

from sqlalchemy import CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func


class CreatedAtMixin:
    """created_at maintained by the database clock. Used by append-only records."""

    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)


class TimestampMixin(CreatedAtMixin):
    """Records that can change after creation."""

    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now(), nullable=False
    )


LATITUDE_CHECK = CheckConstraint(
    "latitude >= -90 AND latitude <= 90", name="ck_latitude_range"
)
LONGITUDE_CHECK = CheckConstraint(
    "longitude >= -180 AND longitude <= 180", name="ck_longitude_range"
)