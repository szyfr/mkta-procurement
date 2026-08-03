import { bffRequest } from "@/lib/api/bff-client";
import { canvassingEndpoints } from "@/modules/canvassing/api/endpoints";
import type { CanvassingList } from "@/modules/canvassing/models/canvassing";
import type { ItemQuotations } from "@/modules/canvassing/models/quotation";

/**
 * Canvassing calls against the BFF. Runs in the browser and knows nothing about
 * FastAPI — Route Handlers return models already, so responses pass straight
 * through. The transport itself lives in `lib/api/bff-client`.
 */

export interface ListCanvassingParams {
  page?: number;
  signal?: AbortSignal;
}

export function fetchCanvassing({ page, signal }: ListCanvassingParams = {}) {
  return bffRequest<CanvassingList>(canvassingEndpoints.list, {
    query: { page },
    signal,
  });
}

/** The quotes covering each of the given purchase request items. */
export function fetchCanvassingQuotations(
  itemIds: string[],
  signal?: AbortSignal,
) {
  return bffRequest<ItemQuotations[]>(canvassingEndpoints.quotations, {
    query: { items: itemIds },
    signal,
  });
}
