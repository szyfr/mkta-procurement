import { serverFetch } from "@/lib/api/fetcher";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/canvassing/constants";
import type {
  CanvassingEntryDto,
  ItemQuotationsDto,
} from "@/modules/canvassing/dto";
import {
  toCanvassingEntry,
  toItemQuotations,
} from "@/modules/canvassing/mappers/canvassing.mapper";
import type {
  CanvassingList,
  ItemQuotations,
} from "@/modules/canvassing/models/canvassing";

/**
 * Canvassing reads against FastAPI. Server-side only, called from Route
 * Handlers — never from a component.
 *
 * The list and the per-item quotations are wired up. `PATCH
 * /canvassing/award/{quotation_id}` is not: awarding a quotation has no
 * matching read, so the UI could never show the result back. There is no by-id
 * read for a canvassing case at all.
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

/**
 * Quotations for a set of purchase request items, one group per item.
 *
 * Two things set this endpoint apart from the rest: it takes the ids as a
 * repeated `items` parameter, and it answers with a bare array rather than the
 * `{ data, pagination }` envelope — there is no paging to apply.
 */
export async function listItemQuotations(
  itemIds: string[],
): Promise<ItemQuotations[]> {
  const response = await serverFetch<ItemQuotationsDto[]>(
    "/canvassing/quotations",
    { query: { items: itemIds } },
  );

  return response.map(toItemQuotations);
}
