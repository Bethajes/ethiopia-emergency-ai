from enum import Enum


class EventType(str, Enum):
    flood = "flood"
    landslide = "landslide"
    earthquake = "earthquake"
    storm = "storm"
    wildfire = "wildfire"
    drought = "drought"
    other = "other"


class Severity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class EventStatus(str, Enum):
    active = "active"
    monitoring = "monitoring"
    contained = "contained"
    resolved = "resolved"


class ReportSource(str, Enum):
    citizen = "citizen"
    field_team = "field_team"
    sensor = "sensor"
    social_media = "social_media"
    satellite = "satellite"
    drone = "drone"
    other = "other"


class ReportType(str, Enum):
    flood = "flood"
    landslide = "landslide"
    earthquake = "earthquake"
    storm = "storm"
    wildfire = "wildfire"
    infrastructure_damage = "infrastructure_damage"
    medical_emergency = "medical_emergency"
    other = "other"


class ResourceType(str, Enum):
    medical = "medical"
    water = "water"
    food = "food"
    shelter = "shelter"
    personnel = "personnel"
    vehicle = "vehicle"
    equipment = "equipment"


class ResourceStatus(str, Enum):
    available = "available"
    deployed = "deployed"
    depleted = "depleted"