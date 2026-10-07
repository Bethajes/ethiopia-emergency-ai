import { http } from "./client";
import type { EmergencyReport, EmergencyReportInput, ReportSource, ReportType } from "./types";

export interface ReportQuery {
  event_id?: number;
  source?: ReportSource;
  report_type?: ReportType;
  verified?: boolean;
  limit?: number;
  offset?: number;
}

export function listReports(query: ReportQuery = {}): Promise<EmergencyReport[]> {
  return http.get<EmergencyReport[]>("/api/reports", { ...query });
}

export function createReport(
  input: EmergencyReportInput,
): Promise<EmergencyReport> {
  return http.post<EmergencyReport>("/api/reports", input);
}