import { http } from "./client";
import type {
  DisasterEvent,
  EventStatus,
  EventType,
  Severity,
} from "./types";

export interface EventQuery {
  event_type?: EventType;
  status?: EventStatus;
  severity?: Severity;
  limit?: number;
  offset?: number;
}

export function listEvents(query: EventQuery = {}): Promise<DisasterEvent[]> {
  return http.get<DisasterEvent[]>("/api/events", { ...query });
}

export function getEvent(eventId: number): Promise<DisasterEvent> {
  return http.get<DisasterEvent>(`/api/events/${eventId}`);
}