import { useEffect, useState } from "react";

import { getHealth } from "@/api/health";
import type { HealthStatus } from "@/api/types";

const POLL_INTERVAL_MS = 30_000;

type SystemState = "checking" | "operational" | "degraded" | "offline";

const STATE_LABELS: Record<SystemState, string> = {
  checking: "Checking",
  operational: "Systems operational",
  degraded: "Degraded",
  offline: "API offline",
};

const STATE_DOT: Record<SystemState, string> = {
  checking: "bg-slate-400",
  operational: "bg-emerald-400",
  degraded: "bg-amber-400",
  offline: "bg-rose-500",
};

/** Live indicator driven by GET /api/health. */
export function StatusIndicator() {
  const [state, setState] = useState<SystemState>("checking");
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const health: HealthStatus = await getHealth();
        if (!active) return;
        const operational = health.database === "up" && health.status === "ok";
        setState(operational ? "operational" : "degraded");
        setDetail(operational ? `PostGIS ready · ${health.environment}` : "Database unreachable");
      } catch {
        if (!active) return;
        setState("offline");
        setDetail(null);
      }
    };

    void poll();
    const timer = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-sm border border-slate-800 bg-ops-900 px-2.5 py-1"
      title={detail ?? undefined}
    >
      <span className={`h-2 w-2 rounded-full ${STATE_DOT[state]}`} aria-hidden="true" />
      <span className="font-mono text-2xs uppercase tracking-[0.18em] text-slate-300">
        {STATE_LABELS[state]}
      </span>
      {detail ? <span className="hidden text-2xs text-slate-500 md:inline">{detail}</span> : null}
    </div>
  );
}