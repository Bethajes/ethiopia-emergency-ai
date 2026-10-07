import { useEffect, useState, type ReactNode } from "react";

function useUtcClock(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now.toISOString().slice(11, 19);
}

export function Header({ children }: { children?: ReactNode }) {
  const time = useUtcClock();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-ops-900 px-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-amber-400">
          NileShield AI
        </span>
        <span className="hidden text-xs text-slate-500 lg:inline">
          AI-powered disaster intelligence for Africa
        </span>
      </div>
      <div className="flex items-center gap-3">
        <time className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-500">
          {time} UTC
        </time>
        {children}
      </div>
    </header>
  );
}