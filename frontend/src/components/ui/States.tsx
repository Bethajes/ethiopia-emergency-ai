export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center justify-center gap-1 px-6 py-8 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      {description ? (
        <p className="max-w-sm text-xs leading-relaxed text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-6 font-mono text-2xs uppercase tracking-[0.2em] text-slate-500">
      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
      {label}
    </div>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="m-4 rounded-sm border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-2xs uppercase tracking-wider text-rose-300">
      {message}
    </div>
  );
}