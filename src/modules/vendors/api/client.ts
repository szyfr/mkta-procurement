import { bffRequest } from "@/lib/api/bff-client";
import { vendorEndpoints } from "@/modules/vendors/api/endpoints";
import type { VendorList } from "@/modules/vendors/models/vendor";

/**
 * Vendor calls against the BFF. Runs in the browser and knows nothing about
 * FastAPI — Route Handlers return models already, so responses pass straight
 * through. The transport itself lives in `lib/api/bff-client`.
 */

export interface ListVendorsParams {
  page?: number;
  signal?: AbortSignal;
}

export function fetchVendors({ page, signal }: ListVendorsParams = {}) {
  return bffRequest<VendorList>(vendorEndpoints.list, {
    query: { page },
    signal,
  });
}
