import { useState } from "react";

import type { DisasterEvent, EventStatus } from "@/api/types";
import { EventList } from "@/components/events/EventList";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorNotice, Spinner } from "@/components/ui/States";
import { useDisasterEvents } from "@/lib/useAsync";

const STATUS_FILTERS: { label: string; value: EventStatus | "" }[] = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Monitoring", value: "monitoring" },
  { label: "Contained", value: "contained" },
  { label: "Resolved", value: "resolved" },
];

export function EventPanel({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<EventStatus | "">("");
  const { data, error, loading } = useDisasterEvents(status || undefined);
  const events: readonly DisasterEvent[] = data ?? [];
  const activeCount = events.filter((event) => event.status === "active").length;

  return (
    <Panel
      title="Disaster events"
      subtitle={
        loading
          ? "Loading records…"
          : `${events.length} record${events.length === 1 ? "" : "s"} · ${activeCount} active`
      }
      actions={
        compact ? undefined : (
          <select
            aria-label="Filter events by status"
            value={status}
            onChange={(event) => setStatus(event.target.value as EventStatus | "")}
            className="rounded-sm border border-slate-700 bg-ops-900 px-2 py-1 font-mono text-2xs uppercase tracking-wider text-slate-300"
          >
            {STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      }
    >
      {error ? <ErrorNotice message={error} /> : null}
      {loading ? <Spinner label="Loading events" /> : null}
      {!loading && !error && events.length === 0 ? (
        <EmptyState
          title="No events recorded"
          description="Nothing has been ingested for this filter yet. Automated detection feeds land in a later phase; until then the platform stores operator-submitted records only."
        />
      ) : null}
      {!loading && events.length > 0 ? <EventList events={events} /> : null}
    </Panel>
  );
}