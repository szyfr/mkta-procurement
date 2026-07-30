import { purchaseRequestEndpoints } from "@/modules/purchase-requests/api/endpoints";
import type {
  LookupPage,
  PurchaseRequest,
  PurchaseRequestList,
} from "@/modules/purchase-requests/models/purchase-request";

/**
 * Frontend API Client — runs in the browser and calls the BFF only.
 *
 * It knows nothing about FastAPI: no upstream URLs, no snake_case DTOs. Route
 * Handlers return models already, so responses pass straight through.
 */

/** What a failed BFF call surfaces to a component. Already user-safe. */
export class PurchaseRequestApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "PurchaseRequestApiError";
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
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, signal } = options;

  const response = await fetch(withQuery(path, query), {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? ((payload as { error?: { message?: string } }).error?.message ??
          "Something went wrong.")
        : "Something went wrong.";

    throw new PurchaseRequestApiError(response.status, message);
  }

  return (payload as { data: T }).data;
}

export interface ListPurchaseRequestsParams {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export function fetchPurchaseRequests({
  page,
  pageSize,
  signal,
}: ListPurchaseRequestsParams = {}) {
  return request<PurchaseRequestList>(purchaseRequestEndpoints.list, {
    query: { page, pageSize },
    signal,
  });
}

export function fetchPurchaseRequest(id: string, signal?: AbortSignal) {
  return request<PurchaseRequest>(purchaseRequestEndpoints.detail(id), {
    signal,
  });
}

export interface CreatePurchaseRequestPayload {
  title: string;
  departmentId: string;
  dateNeeded: string;
  priority: "low" | "normal" | "high";
  justification: string;
  items: { materialId: string; quantity: number; vendorId?: string | null }[];
}

export function createPurchaseRequest(payload: CreatePurchaseRequestPayload) {
  return request<PurchaseRequest>(purchaseRequestEndpoints.create, {
    method: "POST",
    body: payload,
  });
}

export interface UpdatePurchaseRequestPayload
  extends CreatePurchaseRequestPayload {
  /** Sent when submitting a draft for approval, rather than just saving edits. */
  status?: "pending";
}

export function updatePurchaseRequest(
  id: string,
  payload: UpdatePurchaseRequestPayload,
) {
  return request<PurchaseRequest>(purchaseRequestEndpoints.detail(id), {
    method: "PUT",
    body: payload,
  });
}

export function fetchDepartmentOptions(signal?: AbortSignal) {
  return request<LookupPage>(purchaseRequestEndpoints.departments, { signal });
}

export interface LookupParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

export function fetchMaterialOptions({
  page,
  pageSize,
  search,
  signal,
}: LookupParams = {}) {
  return request<LookupPage>(purchaseRequestEndpoints.materials, {
    query: { page, pageSize, search },
    signal,
  });
}

export function fetchVendorOptions({
  page,
  pageSize,
  search,
  signal,
}: LookupParams = {}) {
  return request<LookupPage>(purchaseRequestEndpoints.vendors, {
    query: { page, pageSize, search },
    signal,
  });
}
