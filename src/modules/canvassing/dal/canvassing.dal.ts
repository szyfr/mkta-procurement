import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/canvassing/constants";
import { getVendorLookup } from "@/modules/canvassing/dal/lookup.dal";
import type {
  CanvassingEntryDto,
  PurchaseRequestCanvassingItemDto,
  QuotationsForItemDto,
} from "@/modules/canvassing/dto";
import {
  toCanvassingEntry,
  toPurchaseRequestCanvassingItem,
} from "@/modules/canvassing/mappers/canvassing.mapper";
import type {
  CanvassingList,
  PurchaseRequestCanvassing,
} from "@/modules/canvassing/models/canvassing";

/**
 * Canvassing reads against FastAPI. Server-side only, called from Route
 * Handlers — never from a component.
 *
 * The flat list and the PR-scoped read (with quotations) are wired up.
 * `PATCH /canvassing/award/{quotation_id}` (picking a winning vendor) and
 * `POST /quotations` (submitting a new quote) are not — no mutation is
 * exposed for either, so "Confirm Vendor Selection" and "Add Vendor Quote"
 * stay unwired in the UI.
 */

export interface ListCanvassingQuery {
  page?: number;
  pageSize?: number;
}

export async function listCanvassing(
  query: ListCanvassingQuery = {},
): Promise<CanvassingList> {
  const response = await serverFetch<PaginatedDto<CanvassingEntryDto>>(
    "/canvassing",
    {
      query: {
        page: query.page ?? 1,
        page_size: clampPageSize(query.pageSize, DEFAULT_PAGE_SIZE),
      },
    },
  );

  return {
    entries: response.data.map(toCanvassingEntry),
    page: toPageInfo(response.pagination),
  };
}

const NOT_FOUND = "Purchase request not found";

/**
 * All of a purchase request's canvassing items, each with whatever quotations
 * exist for it.
 *
 * Composes two upstream reads — `/purchase-requests/{id}/canvassing` for the
 * items, then `/canvassing/quotations` for their quotations — into one model,
 * the same way `purchase-requests/dal/purchase-request.dal.ts` composes a
 * detail read with lookups. The browser makes one call either way.
 *
 * Quirk: a missing purchase request comes back as a bare `400
 * {"message": "Bad Request"}`, not a 404 — the controller's own
 * `except HTTPException` catches its 404 and re-reports it as a 400. Same
 * quirk already documented on `updatePurchaseRequestStatus`.
 */
export async function getPurchaseRequestCanvassing(
  purchaseRequestId: string,
): Promise<PurchaseRequestCanvassing> {
  assertObjectId(purchaseRequestId, NOT_FOUND);

  const items = await serverFetch<PurchaseRequestCanvassingItemDto[]>(
    `/purchase-requests/${purchaseRequestId}/canvassing`,
  );

  if (items.length === 0) {
    return { purchaseRequestId, items: [] };
  }

  const [quotationsByItem, vendors] = await Promise.all([
    serverFetch<QuotationsForItemDto[]>("/canvassing/quotations", {
      query: { items: items.map((item) => item._id) },
    }),
    getVendorLookup(),
  ]);

  const quotationsById = new Map(
    quotationsByItem.map((entry) => [entry._id, entry.quotations]),
  );

  return {
    purchaseRequestId,
    items: items.map((item) =>
      toPurchaseRequestCanvassingItem(
        item,
        quotationsById.get(item._id) ?? [],
        vendors,
      ),
    ),
  };
}
