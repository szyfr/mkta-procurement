import { getApiBaseUrl, REQUEST_TIMEOUT_MS } from "@/lib/api/config";
import { forwardedCookieHeader } from "@/lib/api/cookies";
import { ApiError, normalizeBackendError } from "@/lib/api/errors";

/**
 * The single place the server talks to FastAPI. Used only by DALs — Route
 * Handlers and components go through those, never here directly.
 *
 * Every call forwards the caller's cookies upstream — how FastAPI sees the
 * session. There's no cookie jar on the server, so it's an explicit header
 * rather than a `credentials` flag.
 */

export interface ServerFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /**
   * Serialized as JSON, unless it is `FormData` — the quotation endpoints take
   * `multipart/form-data`, which has to go out untouched so the runtime can
   * generate the part boundary.
   */
  body?: unknown;
  /**
   * Appended as a query string; `undefined` and `null` entries are dropped. An
   * array repeats its key (`items=a&items=b`), which is how FastAPI spells a
   * `list[str] = Query(...)` parameter — a comma-joined value is rejected.
   */
  query?: Record<string, string | number | string[] | undefined | null>;
  /**
   * Merged over the defaults, so a caller can replace the forwarded `Cookie`
   * header outright — the login DAL does, to send the exact CSRF token it is
   * about to echo in `X-XSRF-TOKEN`.
   */
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** An upstream call with its `Set-Cookie` lines kept; see `serverFetchWithCookies`. */
export interface UpstreamResponse<T> {
  data: T;
  setCookies: string[];
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

async function request<T>(
  path: string,
  options: ServerFetchOptions,
): Promise<UpstreamResponse<T>> {
  const { method = "GET", body, query, headers, signal } = options;

  // Setting `Content-Type` by hand on a multipart body drops the boundary —
  // leave it to `fetch`.
  const multipart = body instanceof FormData;

  const cookie = await forwardedCookieHeader();

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        Accept: "application/json",
        ...(body === undefined || multipart
          ? {}
          : { "Content-Type": "application/json" }),
        ...(cookie ? { Cookie: cookie } : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : multipart
            ? body
            : JSON.stringify(body),
      // Purchasing data changes constantly — never serve a stale copy from
      // the Next.js data cache.
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

  return { data: payload as T, setCookies: response.headers.getSetCookie() };
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<T> {
  return (await request<T>(path, options)).data;
}

/**
 * The same call, keeping the upstream `Set-Cookie` lines.
 *
 * Only the auth DAL needs them — FastAPI's CSRF endpoint returns an empty body
 * and mints its token via a cookie header alone. Everything else uses
 * `serverFetch`, which discards them: an upstream cookie is scoped to
 * FastAPI's origin and means nothing to the browser until a Route Handler
 * re-issues it on ours.
 */
export async function serverFetchWithCookies<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<UpstreamResponse<T>> {
  return request<T>(path, options);
}
