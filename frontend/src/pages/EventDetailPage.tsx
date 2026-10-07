import type { ReactNode } from "react";

import { Link, useParams } from "react-router-dom";

import { getEvent } from "@/api/events";
import { listReports } from "@/api/reports";
import { MapCanvas } from "@/components/map/MapCanvas";
import { pointsToFeatureCollection } from "@/components/map/geojson";
import type { MapLayerSpec } from "@/components/map/mapStyle";
import { Badge, ConfidenceBadge, EventStatusBadge, SeverityBadge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorNotice, Spinner } from "@/components/ui/States";
import { EVENT_TYPE_LABELS, REPORT_SOURCE_LABELS } from "@/lib/constants";
import { formatCoordinate, formatDateTime } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="mt-1 text-sm text-slate-200">{children}</div>
    </div>
  );
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const event = useAsync(() => getEvent(eventId), [eventId]);
  const reports = useAsync(
    () => listReports({ event_id: eventId, limit: 100 }),
    [eventId],
  );

  if (Number.isNaN(eventId)) {
    return <ErrorNotice message="Invalid event identifier" />;
  }

  if (event.loading) return <Spinner label="Loading event" />;
  if (event.error) {
    return (
      <div className="space-y-3">
        <ErrorNotice message={event.error} />
        <Link to="/events" className="font-mono text-2xs uppercase tracking-wider text-amber-400">
          ← Back to events
        </Link>
      </div>
    );
  }

  const record = event.data;
  if (!record) return <EmptyState title="Event not found" />;

  const mapLayers: MapLayerSpec[] = [
    {
      id: "selected-event",
      kind: "circle",
      data: pointsToFeatureCollection([
        {
          id: record.id,
          title: record.title,
          severity: record.severity,
          longitude: record.longitude,
          latitude: record.latitude,
        },
      ]),
      paint: {
        "circle-radius": 9,
        "circle-color": "#f43f5e",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fecdd3",
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/events"
            className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-500 hover:text-amber-400"
          >
            ← Disaster events
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-slate-100">{record.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Badge>{EVENT_TYPE_LABELS[record.event_type]}</Badge>
            <SeverityBadge severity={record.severity} />
            <EventStatusBadge status={record.status} />
            <ConfidenceBadge confidence={record.confidence} />
          </div>
        </div>
        <span className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-500">
          EVT-{String(record.id).padStart(4, "0")}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Location" subtitle="Approximate epicentre" bodyClassName="p-0" className="min-h-80">
          <MapCanvas center={[record.longitude, record.latitude]} zoom={8} layers={mapLayers} />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel title="Event record">
            <dl className="grid grid-cols-2 gap-4 px-4 py-3">
              <Field label="Severity">{record.severity}</Field>
              <Field label="Status">{record.status}</Field>
              <Field label="Coordinates">
                {formatCoordinate(record.latitude, record.longitude)}
              </Field>
              <Field label="Created">{formatDateTime(record.created_at)}</Field>
              <Field label="Last update">{formatDateTime(record.updated_at)}</Field>
              <Field label="Confidence">{Math.round(record.confidence * 100)}%</Field>
              <div className="col-span-2">
                <Field label="Description">
                  {record.description ?? "No description provided."}
                </Field>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      <Panel
        title="Linked emergency reports"
        subtitle={reports.loading ? "Loading…" : `${reports.data?.length ?? 0} attached`}
      >
        {reports.error ? <ErrorNotice message={reports.error} /> : null}
        {reports.loading ? <Spinner label="Loading reports" /> : null}
        {!reports.loading && (reports.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No linked reports"
            description="Emergency reports submitted against this event will appear here."
          />
        ) : null}
        {!reports.loading && (reports.data?.length ?? 0) > 0 ? (
          <ul className="divide-y divide-slate-800/80">
            {(reports.data ?? []).map((report) => (
              <li key={report.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-200">{report.description}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge>{REPORT_SOURCE_LABELS[report.source]}</Badge>
                    {report.verified ? <Badge tone="online">verified</Badge> : null}
                  </div>
                </div>
                <p className="mt-1 font-mono text-2xs uppercase tracking-[0.15em] text-slate-500">
                  {formatCoordinate(report.latitude, report.longitude)} ·{" "}
                  {formatDateTime(report.created_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </Panel>
    </div>
  );
}