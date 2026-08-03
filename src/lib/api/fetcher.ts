import { getApiBaseUrl, REQUEST_TIMEOUT_MS } from "@/lib/api/config";
import { ApiError, normalizeBackendError } from "@/lib/api/errors";

/**
 * The single place the server talks to FastAPI. Used only by DALs — Route
 * Handlers and components go through those, never through here directly.
 */

export interface ServerFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Serialized as JSON. */
  body?: unknown;
  /**
   * Appended as a query string; `undefined` and `null` entries are dropped. An
   * array repeats the key once per element, which is how FastAPI reads a
   * `list[str]` parameter (`?items=a&items=b`).
   */
  query?: Record<string, string | number | string[] | undefined | null>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query: ServerFetchOptions["query"]): string {
  const url = new URL(`${getApiBaseUrl()}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      for (const entry of value) url.searchParams.append(key, entry);
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function readBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  const { method = "GET", body, query, signal } = options;

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      // Purchasing data is operational and changes constantly; never serve a
      // stale copy from the Next.js data cache.
      cache: "no-store",
      signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    throw new ApiError(
      503,
      "upstream_unavailable",
      cause instanceof Error ? cause.message : "Upstream request failed",
    );
  }

  const payload = await readBody(response);

  if (!response.ok) {
    throw normalizeBackendError(response.status, payload);
  }

  return payload as T;
}
