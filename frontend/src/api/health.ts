import { http } from "./client";
import type { HealthStatus } from "./types";

export function getHealth(): Promise<HealthStatus> {
  return http.get<HealthStatus>("/api/health");
}