/**
 * The single place the browser talks to the BFF.
 *
 * It knows nothing about FastAPI: no upstream URLs, no snake_case DTOs. Route
 * Handlers return models already, so responses pass straight through. Every
 * module's API client is a thin set of named calls on top of this.
 */

/** What a failed BFF call surfaces to a component. Already user-safe. */
export class BffError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BffError";
    this.status = status;
  }
}

/** An array repeats the key once per element, e.g. `?items=a&items=b`. */
type QueryValue = string | number | string[] | undefined | null;

function withQuery(path: string, query?: Record<string, QueryValue>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      for (const entry of value) params.append(key, entry);
      continue;
    }

    params.set(key, String(value));
  }

  const search = params.toString();

  return search ? `${path}?${search}` : path;
}

export interface BffRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

export async function bffRequest<T>(
  path: string,
  options: BffRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, signal } = options;

  const response = await fetch(withQuery(path, query), {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  // Routes that only perform an action answer 204 with no body; there is no
  // `{ data }` envelope to unwrap. Failures always carry one, so this is safe
  // to check before the status.
  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? ((payload as { error?: { message?: string } }).error?.message ??
          "Something went wrong.")
        : "Something went wrong.";

    throw new BffError(response.status, message);
  }

  return (payload as { data: T }).data;
}
