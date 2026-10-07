import { useState } from "react";

import { listResources } from "@/api/resources";
import { RESOURCE_STATUSES, RESOURCE_TYPES } from "@/api/types";
import type { ResourceStatus, ResourceType } from "@/api/types";
import { ResourceStatusBadge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { EmptyState, ErrorNotice, Spinner } from "@/components/ui/States";
import { RESOURCE_TYPE_LABELS } from "@/lib/constants";
import { formatCoordinate, formatQuantity } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";

export function ResourcesPage() {
  const [type, setType] = useState<ResourceType | "">("");
  const [status, setStatus] = useState<ResourceStatus | "">("");

  const { data, error, loading } = useAsync(
    () =>
      listResources({
        limit: 200,
        ...(type ? { resource_type: type } : {}),
        ...(status ? { status } : {}),
      }),
    [type, status],
  );
  const resources = data ?? [];

  const totalAvailable = resources
    .filter((resource) => resource.status === "available")
    .reduce((sum, resource) => sum + resource.quantity, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Resources</h1>
          <p className="text-xs text-slate-500">
            Response assets and their readiness state. Allocation logic arrives in a later phase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter resources by type"
            value={type}
            onChange={(event) => setType(event.target.value as ResourceType | "")}
            className="rounded-sm border border-slate-700 bg-ops-900 px-2 py-1 font-mono text-2xs uppercase tracking-wider text-slate-300"
          >
            <option value="">All types</option>
            {RESOURCE_TYPES.map((value) => (
              <option key={value} value={value}>
                {RESOURCE_TYPE_LABELS[value]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter resources by status"
            value={status}
            onChange={(event) => setStatus(event.target.value as ResourceStatus | "")}
            className="rounded-sm border border-slate-700 bg-ops-900 px-2 py-1 font-mono text-2xs uppercase tracking-wider text-slate-300"
          >
            <option value="">All statuses</option>
            {RESOURCE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span className="font-mono text-2xs uppercase tracking-[0.2em] text-slate-500">
            {loading ? "Loading…" : `${formatQuantity(totalAvailable)} available units`}
          </span>
        </div>
      </div>

      <Panel title="Resource register" subtitle="Stored positions are exact coordinates">
        {error ? <ErrorNotice message={error} /> : null}
        {loading ? <Spinner label="Loading resources" /> : null}
        {!loading && !error && resources.length === 0 ? (
          <EmptyState
            title="No resources registered"
            description="Insert resources via the API or a future admin screen to track availability."
          />
        ) : null}
        {!loading && resources.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 font-mono text-2xs uppercase tracking-[0.15em] text-slate-500">
                  <th className="px-4 py-2 font-normal">ID</th>
                  <th className="px-4 py-2 font-normal">Name</th>
                  <th className="px-4 py-2 font-normal">Type</th>
                  <th className="px-4 py-2 font-normal">Quantity</th>
                  <th className="px-4 py-2 font-normal">Status</th>
                  <th className="px-4 py-2 font-normal">Coordinates</th>
                  <th className="px-4 py-2 font-normal">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-2 font-mono text-2xs text-slate-500">
                      RES-{String(resource.id).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-200">{resource.name}</td>
                    <td className="px-4 py-2 font-mono text-2xs uppercase text-slate-400">
                      {RESOURCE_TYPE_LABELS[resource.resource_type]}
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs text-slate-300">
                      {formatQuantity(resource.quantity)}
                    </td>
                    <td className="px-4 py-2">
                      <ResourceStatusBadge status={resource.status} />
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs text-slate-400">
                      {formatCoordinate(resource.latitude, resource.longitude)}
                    </td>
                    <td className="px-4 py-2 font-mono text-2xs text-slate-500">
                      {resource.updated_at.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}