import { bffRequest } from "@/lib/api/bff-client";
import type { LookupPage } from "@/lib/lookup";
import { paymentTermEndpoints } from "@/modules/payment-terms/api/endpoints";

/**
 * Payment term calls against the BFF. Runs in the browser and knows nothing
 * about FastAPI — Route Handlers return models already, so responses pass
 * straight through. The transport itself lives in `lib/api/bff-client`.
 */

export interface PaymentTermLookupParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

export function fetchPaymentTermOptions({
  page,
  pageSize,
  search,
  signal,
}: PaymentTermLookupParams = {}) {
  return bffRequest<LookupPage>(paymentTermEndpoints.options, {
    query: { page, pageSize, search },
    signal,
  });
}
