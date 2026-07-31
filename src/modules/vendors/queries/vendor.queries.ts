import { queryOptions } from "@tanstack/react-query";

import { fetchVendors } from "@/modules/vendors/api/client";

/**
 * Query definitions for the Vendors UI.
 *
 * These live in the module rather than the component so the cache key and the
 * fetcher stay next to the rest of the vendor surface. The fetcher is still
 * the module's API client, which talks to the BFF — the FastAPI call itself
 * stays in the DAL, server-side.
 */

export const vendorKeys = {
  all: ["vendors"] as const,
  list: (page: number) => ["vendors", page] as const,
};

export function vendorListQuery(page: number) {
  return queryOptions({
    queryKey: vendorKeys.list(page),
    // TanStack supplies an AbortSignal that it aborts when the query is
    // cancelled, which is what unmount/page-change used to do by hand.
    queryFn: ({ signal }) => fetchVendors({ page, signal }),
  });
}
