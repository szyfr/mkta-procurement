import { serverFetch } from "@/lib/api/fetcher";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/canvassing/constants";
import type { CanvassingEntryDto } from "@/modules/canvassing/dto";
import { toCanvassingEntry } from "@/modules/canvassing/mappers/canvassing.mapper";
import type { CanvassingList } from "@/modules/canvassing/models/canvassing";

/**
 * Canvassing reads against FastAPI. Server-side only, called from Route
 * Handlers — never from a component.
 *
 * The list lives here; the quote comparison is in `quotation.dal.ts`. There is
 * no by-id read for a canvassing case at all.
 *
 * `PATCH /canvassing/award/{quotation_id}` stays unwired on purpose: it records
 * the winning vendor from the purchase request item rather than the awarded
 * quotation, and never moves the item out of `canvassing`.
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
