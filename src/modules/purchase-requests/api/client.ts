import { bffRequest } from "@/lib/api/bff-client";
import { purchaseRequestEndpoints } from "@/modules/purchase-requests/api/endpoints";
import type {
  CreatePurchaseRequestPayload,
  LookupPage,
  PurchaseRequest,
  PurchaseRequestList,
  UpdatePurchaseRequestPayload,
} from "@/modules/purchase-requests/models/purchase-request";

/**
 * Purchase request calls against the BFF. Runs in the browser and knows nothing
 * about FastAPI — Route Handlers return models already, so responses pass
 * straight through. The transport itself lives in `lib/api/bff-client`.
 */

export interface ListPurchaseRequestsParams {
  page?: number;
  /** Matches against request title and justification. */
  search?: string;
  priority?: string;
  /** A department id. */
  departments?: string;
  signal?: AbortSignal;
}

export function fetchPurchaseRequests({
  page,
  search,
  priority,
  departments,
  signal,
}: ListPurchaseRequestsParams = {}) {
  return bffRequest<PurchaseRequestList>(purchaseRequestEndpoints.list, {
    query: { page, search, priority, departments },
    signal,
  });
}

export function fetchPurchaseRequest(id: string, signal?: AbortSignal) {
  return bffRequest<PurchaseRequest>(purchaseRequestEndpoints.detail(id), {
    signal,
  });
}

export function createPurchaseRequest(payload: CreatePurchaseRequestPayload) {
  return bffRequest<PurchaseRequest>(purchaseRequestEndpoints.create, {
    method: "POST",
    body: payload,
  });
}

export function updatePurchaseRequest(
  id: string,
  payload: UpdatePurchaseRequestPayload,
) {
  return bffRequest<PurchaseRequest>(purchaseRequestEndpoints.detail(id), {
    method: "PUT",
    body: payload,
  });
}

export function fetchDepartmentOptions(signal?: AbortSignal) {
  return bffRequest<LookupPage>(purchaseRequestEndpoints.departments, {
    signal,
  });
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
  return bffRequest<LookupPage>(purchaseRequestEndpoints.materials, {
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
  return bffRequest<LookupPage>(purchaseRequestEndpoints.vendors, {
    query: { page, pageSize, search },
    signal,
  });
}
