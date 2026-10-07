import { listEvents } from "@/api/events";
import { listReports } from "@/api/reports";
import { listResources } from "@/api/resources";
import type { Severity } from "@/api/types";
import { MapCanvas } from "@/components/map/MapCanvas";
import { EMPTY_FEATURE_COLLECTION, pointsToFeatureCollection } from "@/components/map/geojson";
import type { MapLayerSpec } from "@/components/map/mapStyle";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorNotice, Spinner } from "@/components/ui/States";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import { useAsync } from "@/lib/useAsync";

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#38bdf8",
  medium: "#fbbf24",
  high: "#fb923c",
  critical: "#f43f5e",
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-ops-900 px-3 py-2 shadow-panel">
      <p className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-xl text-slate-100">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const events = useAsync(() => listEvents({ limit: 200 }), []);
  const reports = useAsync(() => listReports({ limit: 200 }), []);
  const resources = useAsync(() => listResources({ limit: 200 }), []);

  const eventRecords = events.data ?? [];
  const activeEvents = eventRecords.filter((event) => event.status === "active");
  const criticalEvents = eventRecords.filter((event) => event.severity === "critical");
  const unverifiedReports = (reports.data ?? []).filter((report) => !report.verified);
  const availableResources = (resources.data ?? []).filter(
    (resource) => resource.status === "available",
  );

  // One declarative layer feeds the map; zones and roads plug in later.
  const mapLayers: MapLayerSpec[] = [
    {
      id: "disaster-events",
      kind: "circle",
      data: pointsToFeatureCollection(
        eventRecords.map((event) => ({
          id: event.id,
          title: event.title,
          severity: event.severity,
          status: event.status,
          type: event.event_type,
          longitude: event.longitude,
          latitude: event.latitude,
        })),
      ),
      paint: {
        "circle-radius": 7,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#0b1220",
        "circle-color": [
          "match",
          ["get", "severity"],
          "critical",
          SEVERITY_COLORS.critical,
          "high",
          SEVERITY_COLORS.high,
          "medium",
          SEVERITY_COLORS.medium,
          SEVERITY_COLORS.low,
        ],
      },
    },
    { id: "flood-zones", kind: "fill", data: EMPTY_FEATURE_COLLECTION, paint: {} },
  ];

  const firstError = events.error ?? reports.error ?? resources.error;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Operations Dashboard</h1>
          <p className="text-xs text-slate-500">
            Live disaster picture for Ethiopia — sourced from the platform database.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label="Events" value={events.loading ? "—" : String(eventRecords.length)} />
          <StatTile label="Active" value={events.loading ? "—" : String(activeEvents.length)} />
          <StatTile label="Critical" value={events.loading ? "—" : String(criticalEvents.length)} />
          <StatTile
            label="Unverified"
            value={reports.loading ? "—" : String(unverifiedReports.length)}
          />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Situation map"
          subtitle="MapLibre · basemap only — satellite, drone and zone layers are not yet enabled"
          className="min-h-96"
          bodyClassName="p-0"
        >
          <MapCanvas layers={mapLayers} />
        </Panel>

        <Panel
          title="Resource picture"
          subtitle={
            resources.loading
              ? "Loading…"
              : `${availableResources.length} available of ${resources.data?.length ?? 0}`
          }
        >
          {resources.error ? <ErrorNotice message={resources.error} /> : null}
          {resources.loading ? <Spinner label="Loading resources" /> : null}
          {!resources.loading && (resources.data?.length ?? 0) === 0 ? (
            <EmptyState
              title="No resources registered"
              description="Response assets will be tracked here once the resource-allocation phase is built."
            />
          ) : null}
          {!resources.loading && (resources.data?.length ?? 0) > 0 ? (
            <ul className="divide-y divide-slate-800/80">
              {(resources.data ?? []).map((resource) => (
                <li key={resource.id} className="flex items-center justify-between gap-3 px-4 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-200">{resource.name}</p>
                    <p className="font-mono text-2xs uppercase tracking-[0.15em] text-slate-500">
                      {resource.resource_type} · {resource.quantity}
                    </p>
                  </div>
                  <span className="font-mono text-2xs uppercase tracking-wider text-slate-400">
                    {resource.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      </div>

      {firstError ? <ErrorNotice message={firstError} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Event register"
          subtitle={
            events.loading
              ? "Loading…"
              : `${eventRecords.length} total · types: ${[
                  ...new Set(eventRecords.map((event) => event.event_type)),
                ]
                  .map((type) => EVENT_TYPE_LABELS[type])
                  .join(", ") || "none"}`
          }
          className="max-h-72"
        >
          {events.loading ? <Spinner label="Loading events" /> : null}
          {!events.loading && eventRecords.length === 0 ? (
            <EmptyState title="No events in database" />
          ) : null}
        </Panel>
        <Panel title="Signal pipeline" subtitle="Planned — not implemented" className="max-h-72">
          <ol className="space-y-2 px-4 py-3 font-mono text-2xs uppercase tracking-[0.15em] text-slate-500">
            <li>Satellite imagery → flood detection</li>
            <li>Weather data → flood risk</li>
            <li>Reports → NLP + geolocation</li>
            <li>Drone imagery → damage detection</li>
            <li className="text-slate-600">↓ evidence fusion engine (future)</li>
          </ol>
        </Panel>
      </div>
    </div>
  );
}