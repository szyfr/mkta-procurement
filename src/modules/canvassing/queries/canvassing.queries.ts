import { queryOptions } from "@tanstack/react-query";

import { fetchCanvassing } from "@/modules/canvassing/api/client";

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
};

export function canvassingListQuery(page: number) {
  return queryOptions({
    queryKey: canvassingKeys.list(page),
    // TanStack supplies an AbortSignal it aborts when the query is cancelled,
    // which covers unmount and page changes.
    queryFn: ({ signal }) => fetchCanvassing({ page, signal }),
  });
}
