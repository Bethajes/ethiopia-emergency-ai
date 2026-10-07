/**
 * Shared API contracts. These mirror the FastAPI Pydantic schemas in
 * backend/app/schemas and must be kept in sync with them.
 */

export const EVENT_TYPES = [
  "flood",
  "landslide",
  "earthquake",
  "storm",
  "wildfire",
  "drought",
  "other",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const EVENT_STATUSES = [
  "active",
  "monitoring",
  "contained",
  "resolved",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const REPORT_SOURCES = [
  "citizen",
  "field_team",
  "sensor",
  "social_media",
  "satellite",
  "drone",
  "other",
] as const;
export type ReportSource = (typeof REPORT_SOURCES)[number];

export const REPORT_TYPES = [
  "flood",
  "landslide",
  "earthquake",
  "storm",
  "wildfire",
  "infrastructure_damage",
  "medical_emergency",
  "other",
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const RESOURCE_TYPES = [
  "medical",
  "water",
  "food",
  "shelter",
  "personnel",
  "vehicle",
  "equipment",
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_STATUSES = ["available", "deployed", "depleted"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export interface HealthStatus {
  status: string;
  service: string;
  environment: string;
  database: "up" | "down";
  postgis_version: string | null;
  timestamp: string;
}

export interface DisasterEvent {
  id: number;
  event_type: EventType;
  title: string;
  description: string | null;
  severity: Severity;
  confidence: number;
  status: EventStatus;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyReport {
  id: number;
  event_id: number | null;
  source: ReportSource;
  report_type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  confidence: number;
  verified: boolean;
  created_at: string;
}

export interface EmergencyReportInput {
  event_id?: number | null;
  source: ReportSource;
  report_type: ReportType;
  description: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  confidence?: number;
  verified?: boolean;
}

export interface Resource {
  id: number;
  resource_type: ResourceType;
  name: string;
  quantity: number;
  latitude: number;
  longitude: number;
  status: ResourceStatus;
  created_at: string;
  updated_at: string;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    detail: string | null;
  };
}