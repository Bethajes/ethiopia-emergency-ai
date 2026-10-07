from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ResourceStatus, ResourceType
from app.schemas.common import Latitude, Longitude


class ResourceCreate(BaseModel):
    resource_type: ResourceType
    name: str = Field(min_length=1, max_length=200)
    quantity: float = Field(ge=0)
    latitude: Latitude
    longitude: Longitude
    status: ResourceStatus = ResourceStatus.available


class ResourceRead(ResourceCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime