import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/canvassing/constants";
import type {
  CanvassAwardDto,
  CanvassingEntryDto,
} from "@/modules/canvassing/dto";
import { toCanvassAward } from "@/modules/canvassing/mappers/award.mapper";
import { toCanvassingEntry } from "@/modules/canvassing/mappers/canvassing.mapper";
import type { CanvassAward } from "@/modules/canvassing/models/award";
import type { CanvassingList } from "@/modules/canvassing/models/canvassing";

/**
 * Canvassing reads and awards against FastAPI. Server-side only, called from
 * Route Handlers — never from a component.
 *
 * The list and the award live here; the quote comparison is in
 * `quotation.dal.ts`. There is no by-id read for a canvassing case at all.
 */

const NOT_FOUND = "We couldn't find that quotation.";

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

/**
 * Awards a quotation the given purchase request items.
 *
 * Three upstream quirks shape what the UI can promise here:
 *
 * - The award records the *item's* stored `vendor_id`, never the awarded
 *   quotation's. Items routed to canvassing are created without a vendor and no
 *   endpoint sets one, so awarding such an item fails upstream as a 500 until
 *   the backend takes the vendor from the quotation.
 * - The item keeps its stored status; only the canvassing list reflects the
 *   award, where the derived label flips to "Vendor Selected".
 * - Awards are keyed by (purchase request, material) and nothing prevents a
 *   second insert, so awarding twice records a duplicate rather than replacing.
 */
export async function awardQuotation(
  quotationId: string,
  itemIds: string[],
): Promise<CanvassAward[]> {
  assertObjectId(quotationId, NOT_FOUND);

  // One award document per item, as a bare array — no `{ data }` envelope.
  const dtos = await serverFetch<CanvassAwardDto[]>(
    `/canvassing/award/${quotationId}`,
    { method: "PATCH", body: { items: itemIds } },
  );

  return dtos.map(toCanvassAward);
}
