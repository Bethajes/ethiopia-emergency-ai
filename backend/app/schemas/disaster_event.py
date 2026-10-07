from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import EventStatus, EventType, Severity
from app.schemas.common import Confidence, Latitude, Longitude


class DisasterEventBase(BaseModel):
    event_type: EventType
    title: str = Field(min_length=3, max_length=200)
    description: str | None = Field(default=None, max_length=10_000)
    severity: Severity
    confidence: Confidence = 0.0
    status: EventStatus = EventStatus.active
    latitude: Latitude
    longitude: Longitude


class DisasterEventCreate(DisasterEventBase):
    pass


class DisasterEventRead(DisasterEventBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class DisasterEventSummary(DisasterEventBase):
    """Slim projection for list endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime