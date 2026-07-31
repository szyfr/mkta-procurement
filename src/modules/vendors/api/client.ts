import { vendorEndpoints } from "@/modules/vendors/api/endpoints";
import type { VendorList } from "@/modules/vendors/models/vendor";

/**
 * Frontend API Client — runs in the browser and calls the BFF only.
 *
 * It knows nothing about FastAPI: no upstream URLs, no snake_case DTOs. Route
 * Handlers return models already, so responses pass straight through.
 */

/** What a failed BFF call surfaces to a component. Already user-safe. */
export class VendorApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "VendorApiError";
    this.status = status;
  }
}

type QueryValue = string | number | undefined | null;

function withQuery(path: string, query?: Record<string, QueryValue>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const search = params.toString();

  return search ? `${path}?${search}` : path;
}

interface RequestOptions {
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, signal } = options;

  const response = await fetch(withQuery(path, query), { signal });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? ((payload as { error?: { message?: string } }).error?.message ??
          "Something went wrong.")
        : "Something went wrong.";

    throw new VendorApiError(response.status, message);
  }

  return (payload as { data: T }).data;
}

export interface ListVendorsParams {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export function fetchVendors({
  page,
  pageSize,
  signal,
}: ListVendorsParams = {}) {
  return request<VendorList>(vendorEndpoints.list, {
    query: { page, pageSize },
    signal,
  });
}
