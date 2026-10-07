import { useState } from "react";

import { listReports } from "@/api/reports";
import { REPORT_SOURCES } from "@/api/types";
import type { EmergencyReport, ReportSource } from "@/api/types";
import { Badge, SeverityBadge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorNotice, Spinner } from "@/components/ui/States";
import { REPORT_SOURCE_LABELS, REPORT_TYPE_LABELS } from "@/lib/constants";
import { formatCoordinate, formatDateTime } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";

export function ReportsPage() {
  const [source, setSource] = useState<ReportSource | "">("");
  const { data, error, loading } = useAsync(
    () => listReports(source ? { source, limit: 200 } : { limit: 200 }),
    [source],
  );
  const reports: readonly EmergencyReport[] = data ?? [];

  const unverified = reports.filter((report) => !report.verified).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Emergency Reports</h1>
          <p className="text-xs text-slate-500">
            Field and citizen reports submitted to the platform. Unverified entries are awaiting
            review.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="Filter reports by source"
            value={source}
            onChange={(event) => setSource(event.target.value as ReportSource | "")}
            className="rounded-sm border border-slate-700 bg-ops-900 px-2 py-1 font-mono text-2xs uppercase tracking-wider text-slate-300"
          >
            <option value="">All sources</option>
            {REPORT_SOURCES.map((value) => (
              <option key={value} value={value}>
                {REPORT_SOURCE_LABELS[value]}
              </option>
            ))}
          </select>
          <span className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-500">
            {loading ? "Loading…" : `${reports.length} total · ${unverified} unverified`}
          </span>
        </div>
      </div>

      <Panel title="Report log" subtitle="Newest first">
        {error ? <ErrorNotice message={error} /> : null}
        {loading ? <Spinner label="Loading reports" /> : null}
        {!loading && !error && reports.length === 0 ? (
          <EmptyState
            title="No reports submitted"
            description="Use POST /api/reports to submit an emergency report; it appears here immediately."
          />
        ) : null}
        {!loading && reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-2xs uppercase tracking-[0.15em] text-slate-500">
                  <th className="px-4 py-2 font-normal">ID</th>
                  <th className="px-4 py-2 font-normal">Description</th>
                  <th className="px-4 py-2 font-normal">Type</th>
                  <th className="px-4 py-2 font-normal">Source</th>
                  <th className="px-4 py-2 font-normal">Severity</th>
                  <th className="px-4 py-2 font-normal">Location</th>
                  <th className="px-4 py-2 font-normal">Event</th>
                  <th className="px-4 py-2 font-normal">Verified</th>
                  <th className="px-4 py-2 font-normal">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {reports.map((report) => (
                  <tr key={report.id} className="align-top hover:bg-slate-800/30">
                    <td className="px-4 py-2 font-mono text-2xs text-slate-500">
                      RPT-{String(report.id).padStart(4, "0")}
                    </td>
                    <td className="max-w-sm px-4 py-2 text-sm text-slate-200">
                      {report.description}
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs uppercase text-slate-400">
                      {REPORT_TYPE_LABELS[report.report_type]}
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs uppercase text-slate-400">
                      {REPORT_SOURCE_LABELS[report.source]}
                    </td>
                    <td className="px-4 py-2">
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs text-slate-400">
                      {formatCoordinate(report.latitude, report.longitude)}
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs text-slate-400">
                      {report.event_id ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      {report.verified ? (
                        <Badge tone="online">verified</Badge>
                      ) : (
                        <Badge>pending</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs text-slate-500">
                      {formatDateTime(report.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>

      <p className="font-mono text-2xs uppercase tracking-[0.15em] text-slate-600">
        Report submission (POST /api/reports) is enabled; geolocation extraction from free text
        arrives with the NLP phase
      </p>
    </div>
  );
}