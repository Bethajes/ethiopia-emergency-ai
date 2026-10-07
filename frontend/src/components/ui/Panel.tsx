import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-md border border-slate-800 bg-ops-900 shadow-panel ${className}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-2">
        <div className="min-w-0">
          <h2 className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-400">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {actions}
      </header>
      <div className={`min-h-0 flex-1 overflow-auto ${bodyClassName}`}>{children}</div>
    </section>
  );
}