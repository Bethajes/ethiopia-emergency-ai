from pydantic import TypeAdapter

from app.schemas.common import Confidence, Latitude, Longitude
from app.schemas.disaster_event import (
    DisasterEventCreate,
    DisasterEventRead,
    DisasterEventSummary,
)
from app.schemas.emergency_report import EmergencyReportCreate, EmergencyReportRead
from app.schemas.error import ErrorResponse
from app.schemas.health import HealthResponse
from app.schemas.resource import ResourceCreate, ResourceRead

LatitudeAdapter = TypeAdapter(Latitude)
LongitudeAdapter = TypeAdapter(Longitude)
ConfidenceAdapter = TypeAdapter(Confidence)

__all__ = [
    "ConfidenceAdapter",
    "DisasterEventCreate",
    "DisasterEventRead",
    "DisasterEventSummary",
    "EmergencyReportCreate",
    "EmergencyReportRead",
    "ErrorResponse",
    "HealthResponse",
    "LatitudeAdapter",
    "LongitudeAdapter",
    "ResourceCreate",
    "ResourceRead",
]