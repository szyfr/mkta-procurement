import { bffRequest } from "@/lib/api/bff-client";
import type { Paginated } from "@/lib/api/pagination";
import { vendorEndpoints } from "@/modules/vendors/api/endpoints";
import type { Vendor } from "@/modules/vendors/models/vendor";

/**
 * Vendor calls against the BFF. Runs in the browser and knows nothing about
 * FastAPI's address — Route Handlers pass the upstream response through
 * untouched. The transport itself lives in `lib/api/bff-client`.
 */

export interface ListVendorsParams {
  page?: number;
  signal?: AbortSignal;
}

export function fetchVendors({ page, signal }: ListVendorsParams = {}) {
  return bffRequest<Paginated<Vendor>>(vendorEndpoints.list, {
    query: { page },
    signal,
  });
}
