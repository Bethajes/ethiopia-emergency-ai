import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/events", label: "Disaster events", end: false },
  { to: "/reports", label: "Emergency reports", end: false },
  { to: "/resources", label: "Resources", end: false },
] as const;

export function Sidebar() {
  return (
    <nav
      aria-label="Primary"
      className="flex w-56 shrink-0 flex-col border-r border-slate-800 bg-ops-900"
    >
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="font-mono text-2xs uppercase tracking-[0.25em] text-slate-500">
          Operations
        </p>
      </div>
      <ul className="flex flex-col gap-0.5 p-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-sm px-3 py-2 font-mono text-2xs uppercase tracking-[0.18em] transition-colors ${
                  isActive
                    ? "bg-amber-400/10 text-amber-300 shadow-[inset_2px_0_0_0_#fbbf24]"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-slate-800 p-3">
        <p className="font-mono text-2xs uppercase leading-relaxed tracking-[0.15em] text-slate-600">
          Foundation build
          <br />
          Stage 1 · core services
        </p>
      </div>
    </nav>
  );
}