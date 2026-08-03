import { queryOptions } from "@tanstack/react-query";

import {
  fetchCanvassing,
  fetchItemQuotations,
} from "@/modules/canvassing/api/client";

/**
 * Query definitions for the Canvassing UI.
 *
 * These live in the module rather than the component so the cache key and the
 * fetcher stay next to the rest of the canvassing surface. The fetcher is still
 * the module's API client, which talks to the BFF — the FastAPI call itself
 * stays in the DAL, server-side.
 */

export const canvassingKeys = {
  all: ["canvassing"] as const,
  list: (page: number) => ["canvassing", page] as const,
  quotations: (itemIds: string[]) =>
    ["canvassing", "quotations", itemIds] as const,
};

export function canvassingListQuery(page: number) {
  return queryOptions({
    queryKey: canvassingKeys.list(page),
    // TanStack supplies an AbortSignal it aborts when the query is cancelled,
    // which covers unmount and page changes.
    queryFn: ({ signal }) => fetchCanvassing({ page, signal }),
  });
}

/**
 * Quotations for a request's items. The ids come from the request itself, so
 * this stays idle until that query has resolved — an empty list would other-
 * wise be a 422 from the Route Handler.
 */
export function itemQuotationsQuery(itemIds: string[]) {
  return queryOptions({
    queryKey: canvassingKeys.quotations(itemIds),
    queryFn: ({ signal }) => fetchItemQuotations(itemIds, signal),
    enabled: itemIds.length > 0,
  });
}
