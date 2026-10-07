import { useCallback, useEffect, useState } from "react";

import { ApiError } from "@/api/client";
import { listEvents } from "@/api/events";
import type { EventStatus } from "@/api/types";

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

/** Shared data-loading hook so pages stay declarative. */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    loader()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof ApiError ? cause.message : "Unexpected error");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [...deps, nonce]);

  return { data, error, loading, reload };
}

export function useDisasterEvents(status?: EventStatus) {
  return useAsync(() => listEvents(status ? { status } : {}), [status]);
}