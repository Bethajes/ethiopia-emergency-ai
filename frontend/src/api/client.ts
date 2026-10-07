import type { ApiErrorEnvelope } from "./types";

/**
 * Base URL for API calls. Empty string means "same origin", which is what the
 * Vite dev server proxy expects in development and what a reverse proxy
 * provides in production. Override with VITE_API_BASE_URL when the API lives
 * on a different host.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string | null;

  constructor(status: number, envelope: ApiErrorEnvelope | null, fallback: string) {
    super(envelope?.error.message ?? fallback);
    this.name = "ApiError";
    this.status = status;
    this.code = envelope?.error.code ?? "unknown_error";
    this.detail = envelope?.error.detail ?? null;
  }
}

async function readEnvelope(response: Response): Promise<ApiErrorEnvelope | null> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as ApiErrorEnvelope).error?.message === "string"
    ) {
      return body as ApiErrorEnvelope;
    }
  } catch {
    // Non-JSON error bodies (proxy errors, HTML) fall through to the fallback.
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...init?.headers },
      ...init,
    });
  } catch {
    throw new ApiError(0, null, "Network unreachable — is the API running?");
  }

  if (!response.ok) {
    const envelope = await readEnvelope(response);
    throw new ApiError(response.status, envelope, `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const http = {
  get: <T>(path: string, params?: Record<string, string | number | boolean | undefined>) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined) search.set(key, String(value));
    }
    const query = search.toString();
    return request<T>(query ? `${path}?${query}` : path);
  },
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};