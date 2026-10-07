import { Link } from "react-router-dom";

import type { DisasterEvent } from "@/api/types";
import {
  ConfidenceBadge,
  EventStatusBadge,
  SeverityBadge,
} from "@/components/ui/Badge";
import { formatCoordinate, formatDateTime } from "@/lib/format";
import { EVENT_TYPE_LABELS } from "@/lib/constants";

export function EventList({ events }: { events: readonly DisasterEvent[] }) {
  return (
    <ul className="divide-y divide-slate-800/80">
      {events.map((event) => (
        <li key={event.id}>
          <Link
            to={`/events/${event.id}`}
            className="block px-4 py-3 transition-colors hover:bg-slate-800/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-200">{event.title}</p>
                <p className="mt-0.5 font-mono text-2xs uppercase tracking-[0.15em] text-slate-500">
                  {EVENT_TYPE_LABELS[event.event_type]} ·{" "}
                  {formatCoordinate(event.latitude, event.longitude)} ·{" "}
                  {formatDateTime(event.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                <SeverityBadge severity={event.severity} />
                <EventStatusBadge status={event.status} />
                <ConfidenceBadge confidence={event.confidence} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}