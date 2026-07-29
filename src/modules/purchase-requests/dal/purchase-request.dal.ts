import { getRequesterId } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/fetcher";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/modules/purchase-requests/constants";
import {
  getDepartmentLookup,
  getVendorLookup,
} from "@/modules/purchase-requests/dal/lookup.dal";
import type {
  CreatePurchaseRequestDto,
  PaginatedDto,
  PurchaseRequestDetailDto,
  PurchaseRequestDto,
  UpdatePurchaseRequestDto,
} from "@/modules/purchase-requests/dto";
import {
  toPageInfo,
  toPurchaseRequest,
} from "@/modules/purchase-requests/mappers/purchase-request.mapper";
import type {
  PurchaseRequest,
  PurchaseRequestList,
} from "@/modules/purchase-requests/models/purchase-request";

/**
 * Purchase request reads and writes against FastAPI. Server-side only, called
 * from Route Handlers — never from a component.
 */

export interface ListPurchaseRequestsQuery {
  page?: number;
  pageSize?: number;
}

/** Anything that isn't a 24-character hex string is a 404 from our side. */
function assertObjectId(id: string) {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(404, "not_found", "Purchase request not found");
  }
}

export async function listPurchaseRequests(
  query: ListPurchaseRequestsQuery = {},
): Promise<PurchaseRequestList> {
  const pageSize = Math.min(
    Math.max(query.pageSize ?? DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );

  // The list endpoint returns neither items nor a department join, so names are
  // resolved from the memoized lookup alongside it.
  const [response, departments] = await Promise.all([
    serverFetch<PaginatedDto<PurchaseRequestDto>>("/purchase-requests", {
      query: { page: query.page ?? 1, page_size: pageSize },
    }),
    getDepartmentLookup(),
  ]);

  return {
    requests: response.data.map((dto) =>
      toPurchaseRequest(dto, { departments }),
    ),
    page: toPageInfo(response.pagination),
  };
}

export async function getPurchaseRequest(id: string): Promise<PurchaseRequest> {
  assertObjectId(id);

  const [dto, departments, vendors] = await Promise.all([
    serverFetch<PurchaseRequestDetailDto | null>(`/purchase-requests/${id}`),
    getDepartmentLookup(),
    getVendorLookup(),
  ]);

  // `get_full_details` returns a bare `null` body when the aggregation misses.
  if (!dto) {
    throw new ApiError(404, "not_found", "Purchase request not found");
  }

  return toPurchaseRequest(dto, { departments, vendors });
}

export interface CreatePurchaseRequestInput {
  title: string;
  departmentId: string;
  dateNeeded: string;
  priority: CreatePurchaseRequestDto["priority"];
  justification: string;
  items: { materialId: string; quantity: number; vendorId?: string | null }[];
}

export async function createPurchaseRequest(
  input: CreatePurchaseRequestInput,
): Promise<PurchaseRequest> {
  const payload: CreatePurchaseRequestDto = {
    // Supplied server-side; the browser never picks its own requester.
    requester_id: getRequesterId(),
    department_id: input.departmentId,
    title: input.title,
    date_needed: input.dateNeeded,
    priority: input.priority,
    justification: input.justification,
    items: input.items.map((item) => ({
      material_id: item.materialId,
      quantity: item.quantity,
      vendor_id: item.vendorId || null,
    })),
  };

  const dto = await serverFetch<PurchaseRequestDetailDto>(
    "/purchase-requests",
    {
      method: "POST",
      body: payload,
    },
  );

  const departments = await getDepartmentLookup();

  // The create response carries no material join, so items map to bare ids
  // here. Callers that need full items re-read the request by id.
  return toPurchaseRequest(dto, { departments });
}

export async function updatePurchaseRequest(
  id: string,
  input: UpdatePurchaseRequestDto,
): Promise<PurchaseRequest> {
  assertObjectId(id);

  const dto = await serverFetch<PurchaseRequestDetailDto>(
    `/purchase-requests/${id}`,
    { method: "PUT", body: input },
  );

  const departments = await getDepartmentLookup();

  return toPurchaseRequest(dto, { departments });
}

export async function deletePurchaseRequest(id: string): Promise<void> {
  assertObjectId(id);

  await serverFetch<null>(`/purchase-requests/${id}`, { method: "DELETE" });
}
