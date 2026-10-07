import { listEvents } from "@/api/events";
import type { Severity } from "@/api/types";
import { EventPanel } from "@/components/events/EventPanel";
import { MapCanvas } from "@/components/map/MapCanvas";
import { pointsToFeatureCollection } from "@/components/map/geojson";
import type { MapLayerSpec } from "@/components/map/mapStyle";
import { Panel } from "@/components/ui/Panel";
import { useAsync } from "@/lib/useAsync";

const SEVERITY_COLORS: Record<Severity, string> = {
  low: "#38bdf8",
  medium: "#fbbf24",
  high: "#fb923c",
  critical: "#f43f5e",
};

export function EventsPage() {
  const events = useAsync(() => listEvents({ limit: 200 }), []);
  const records = events.data ?? [];

  const mapLayers: MapLayerSpec[] = [
    {
      id: "disaster-events",
      kind: "circle",
      data: pointsToFeatureCollection(
        records.map((event) => ({
          id: event.id,
          title: event.title,
          severity: event.severity,
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
  ];

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Disaster Events</h1>
        <p className="text-xs text-slate-500">
          Every event currently stored in the database, with its map position.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Event map"
          subtitle="Points only — polygons, roads and zones come later"
          className="min-h-[28rem]"
          bodyClassName="p-0"
        >
          <MapCanvas layers={mapLayers} />
        </Panel>
        <EventPanel />
      </div>
    </div>
  );
}