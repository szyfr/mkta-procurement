import { bffRequest } from "@/lib/api/bff-client";
import type { Paginated } from "@/lib/api/pagination";
import type { Department } from "@/modules/departments";
import { purchaseRequestEndpoints } from "@/modules/purchase-requests/api/endpoints";
import type {
  CreatePurchaseRequestInput,
  UpdatePurchaseRequestDto,
} from "@/modules/purchase-requests/dto";
import type { Material } from "@/modules/purchase-requests/models/material";
import type {
  PurchaseRequest,
  PurchaseRequestDetail,
  SettablePurchaseRequestStatus,
} from "@/modules/purchase-requests/models/purchase-request";
import type { Vendor } from "@/modules/vendors";

/**
 * Purchase request calls against the BFF. Runs in the browser and knows nothing
 * about FastAPI's address — Route Handlers pass the upstream response through
 * untouched. The transport itself lives in `lib/api/bff-client`.
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
  return bffRequest<Paginated<PurchaseRequest>>(purchaseRequestEndpoints.list, {
    query: { page, search, priority, departments },
    signal,
  });
}

export function fetchPurchaseRequest(id: string, signal?: AbortSignal) {
  return bffRequest<PurchaseRequestDetail>(
    purchaseRequestEndpoints.detail(id),
    { signal },
  );
}

export function createPurchaseRequest(payload: CreatePurchaseRequestInput) {
  return bffRequest<PurchaseRequestDetail>(purchaseRequestEndpoints.create, {
    method: "POST",
    body: payload,
  });
}

export function updatePurchaseRequest(
  id: string,
  payload: UpdatePurchaseRequestDto,
) {
  return bffRequest<PurchaseRequestDetail>(
    purchaseRequestEndpoints.detail(id),
    { method: "PUT", body: payload },
  );
}

/**
 * Submitting for approval (`pending`) and cancelling (`canceled`) are the same
 * transition endpoint with a different segment. Deliberately not folded into
 * `updatePurchaseRequest`: this also cascades the new status onto the request's
 * items, which a plain PUT does not do. Returns nothing — callers refetch.
 */
export function setPurchaseRequestStatus(
  id: string,
  status: SettablePurchaseRequestStatus,
) {
  return bffRequest<void>(purchaseRequestEndpoints.status(id, status), {
    method: "PATCH",
  });
}

export interface LookupParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

export function fetchDepartmentOptions({
  page,
  pageSize,
  signal,
}: LookupParams = {}) {
  return bffRequest<Paginated<Department>>(
    purchaseRequestEndpoints.departments,
    { query: { page, pageSize }, signal },
  );
}

export function fetchMaterialOptions({
  page,
  pageSize,
  search,
  signal,
}: LookupParams = {}) {
  return bffRequest<Paginated<Material>>(purchaseRequestEndpoints.materials, {
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
  return bffRequest<Paginated<Vendor>>(purchaseRequestEndpoints.vendors, {
    query: { page, pageSize, search },
    signal,
  });
}
