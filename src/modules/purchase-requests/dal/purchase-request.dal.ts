import { getRequesterId } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/purchase-requests/constants";
import type {
  CreatePurchaseRequestDto,
  PurchaseRequestDetailDto,
  PurchaseRequestDto,
  PurchaseRequestStatusDto,
  UpdatePurchaseRequestDto,
} from "@/modules/purchase-requests/dto";
import { toPurchaseRequest } from "@/modules/purchase-requests/mappers/purchase-request.mapper";
import type {
  CreatePurchaseRequestPayload,
  PurchaseRequest,
  PurchaseRequestList,
} from "@/modules/purchase-requests/models/purchase-request";

/**
 * Purchase request reads and writes against FastAPI. Server-side only, called
 * from Route Handlers — never from a component.
 */

const NOT_FOUND = "Purchase request not found";

export interface ListPurchaseRequestsQuery {
  page?: number;
  pageSize?: number;
  /** Matches against request title and justification. */
  search?: string;
  priority?: string;
  /** A department id. */
  departments?: string;
}

export async function listPurchaseRequests(
  query: ListPurchaseRequestsQuery = {},
): Promise<PurchaseRequestList> {
  const response = await serverFetch<PaginatedDto<PurchaseRequestDto>>(
    "/purchase-requests",
    {
      query: {
        page: query.page ?? 1,
        page_size: clampPageSize(query.pageSize, DEFAULT_PAGE_SIZE),
        search: query.search,
        priority: query.priority,
        departments: query.departments,
      },
    },
  );

  return {
    requests: response.data.map(toPurchaseRequest),
    page: toPageInfo(response.pagination),
  };
}

export async function getPurchaseRequest(id: string): Promise<PurchaseRequest> {
  assertObjectId(id, NOT_FOUND);

  const dto = await serverFetch<PurchaseRequestDetailDto | null>(
    `/purchase-requests/${id}`,
  );

  // `get_full_details` returns a bare `null` body when the aggregation misses.
  if (!dto) {
    throw new ApiError(404, "not_found", NOT_FOUND);
  }

  return toPurchaseRequest(dto);
}

export async function createPurchaseRequest(
  input: CreatePurchaseRequestPayload,
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

  // The create response carries no material join, so items map to bare ids
  // here. Callers that need full items re-read the request by id.
  return toPurchaseRequest(dto);
}

export async function updatePurchaseRequest(
  id: string,
  input: UpdatePurchaseRequestDto,
): Promise<PurchaseRequest> {
  assertObjectId(id, NOT_FOUND);

  const dto = await serverFetch<PurchaseRequestDetailDto>(
    `/purchase-requests/${id}`,
    { method: "PUT", body: input },
  );

  return toPurchaseRequest(dto);
}

/**
 * The dedicated status transition. Unlike a PUT carrying `status`, this also
 * writes the new status onto every item on the request, which is what makes it
 * the only correct way to submit a draft.
 *
 * Two backend quirks: the 204 comes back with a `{}` body (dropped by
 * `serverFetch`), and a missing request is reported as 400 rather than 404
 * because the controller catches its own `HTTPException`. `assertObjectId`
 * still turns a malformed id into a local 404 before the round trip.
 */
export async function updatePurchaseRequestStatus(
  id: string,
  status: PurchaseRequestStatusDto,
): Promise<void> {
  assertObjectId(id, NOT_FOUND);

  await serverFetch<null>(`/purchase-requests/${id}/status/${status}`, {
    method: "PATCH",
  });
}

export async function deletePurchaseRequest(id: string): Promise<void> {
  assertObjectId(id, NOT_FOUND);

  await serverFetch<null>(`/purchase-requests/${id}`, { method: "DELETE" });
}
