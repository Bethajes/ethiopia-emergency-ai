import type {
  EventStatus,
  EventType,
  ReportSource,
  ReportType,
  ResourceStatus,
  ResourceType,
  Severity,
} from "@/api/types";

/** Approximate centre of Ethiopia: [longitude, latitude], GeoJSON axis order. */
export const ETHIOPIA_CENTER: [number, number] = [40.5, 9.1];
export const ETHIOPIA_ZOOM = 5.2;

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  flood: "Flood",
  landslide: "Landslide",
  earthquake: "Earthquake",
  storm: "Storm",
  wildfire: "Wildfire",
  drought: "Drought",
  other: "Other",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  active: "Active",
  monitoring: "Monitoring",
  contained: "Contained",
  resolved: "Resolved",
};

export const REPORT_SOURCE_LABELS: Record<ReportSource, string> = {
  citizen: "Citizen",
  field_team: "Field team",
  sensor: "Sensor",
  social_media: "Social media",
  satellite: "Satellite",
  drone: "Drone",
  other: "Other",
};

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  flood: "Flood",
  landslide: "Landslide",
  earthquake: "Earthquake",
  storm: "Storm",
  wildfire: "Wildfire",
  infrastructure_damage: "Infrastructure damage",
  medical_emergency: "Medical emergency",
  other: "Other",
};

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  medical: "Medical",
  water: "Water",
  food: "Food",
  shelter: "Shelter",
  personnel: "Personnel",
  vehicle: "Vehicle",
  equipment: "Equipment",
};

export const RESOURCE_STATUS_LABELS: Record<ResourceStatus, string> = {
  available: "Available",
  deployed: "Deployed",
  depleted: "Depleted",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};