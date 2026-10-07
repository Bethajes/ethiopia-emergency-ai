import type { ReactNode } from "react";

import type { EventStatus, ResourceStatus, Severity } from "@/api/types";

type Tone = "neutral" | "low" | "medium" | "high" | "critical" | "online" | "offline";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "border-slate-600 bg-slate-800/60 text-slate-300",
  low: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  high: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  critical: "border-rose-500/50 bg-rose-500/15 text-rose-300",
  online: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  offline: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

const SEVERITY_TONE: Record<Severity, Tone> = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical",
};

const EVENT_STATUS_TONE: Record<EventStatus, Tone> = {
  active: "critical",
  monitoring: "medium",
  contained: "low",
  resolved: "neutral",
};

const RESOURCE_STATUS_TONE: Record<ResourceStatus, Tone> = {
  available: "online",
  deployed: "medium",
  depleted: "offline",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-2xs uppercase tracking-wider ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge tone={SEVERITY_TONE[severity]}>{severity}</Badge>;
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <Badge tone={EVENT_STATUS_TONE[status]}>{status}</Badge>;
}

export function ResourceStatusBadge({ status }: { status: ResourceStatus }) {
  return <Badge tone={RESOURCE_STATUS_TONE[status]}>{status}</Badge>;
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percent = Math.round(confidence * 100);
  const tone: Tone = percent >= 75 ? "online" : percent >= 40 ? "medium" : "neutral";
  return <Badge tone={tone}>conf {percent}%</Badge>;
}