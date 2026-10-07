from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ReportSource, ReportType, Severity
from app.schemas.common import Confidence, Latitude, Longitude


class EmergencyReportCreate(BaseModel):
    event_id: int | None = Field(
        default=None, description="Optional link to a confirmed disaster event"
    )
    source: ReportSource
    report_type: ReportType
    description: str = Field(min_length=1, max_length=10_000)
    latitude: Latitude
    longitude: Longitude
    severity: Severity
    confidence: Confidence = 0.0
    verified: bool = False


class EmergencyReportRead(EmergencyReportCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime