import { bffRequest } from "@/lib/api/bff-client";
import type { LookupPage } from "@/lib/lookup";
import { paymentTermEndpoints } from "@/modules/payment-terms/api/endpoints";
import type {
  PaymentTerm,
  PaymentTermList,
  PaymentTermPayload,
} from "@/modules/payment-terms/models/payment-term";

/**
 * Payment term calls against the BFF. Runs in the browser and knows nothing
 * about FastAPI — Route Handlers return models already, so responses pass
 * straight through. The transport itself lives in `lib/api/bff-client`.
 */

export interface ListPaymentTermsParams {
  page?: number;
  signal?: AbortSignal;
}

export function fetchPaymentTerms({
  page,
  signal,
}: ListPaymentTermsParams = {}) {
  return bffRequest<PaymentTermList>(paymentTermEndpoints.list, {
    query: { page },
    signal,
  });
}

export function createPaymentTerm(payload: PaymentTermPayload) {
  return bffRequest<PaymentTerm>(paymentTermEndpoints.create, {
    method: "POST",
    body: payload,
  });
}

export function updatePaymentTerm(id: string, payload: PaymentTermPayload) {
  return bffRequest<PaymentTerm>(paymentTermEndpoints.detail(id), {
    method: "PUT",
    body: payload,
  });
}

export function deletePaymentTerm(id: string) {
  return bffRequest<null>(paymentTermEndpoints.detail(id), {
    method: "DELETE",
  });
}

export interface PaymentTermLookupParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

/**
 * Adapts the same list endpoint into a `LookupPage` for the quotation form's
 * picker, which has no use for the full model — only an id, a label and a
 * hint to show under it.
 */
export async function fetchPaymentTermOptions({
  page,
  pageSize,
  search,
  signal,
}: PaymentTermLookupParams = {}): Promise<LookupPage> {
  const result = await bffRequest<PaymentTermList>(
    paymentTermEndpoints.options,
    {
      query: { page, pageSize, search },
      signal,
    },
  );

  return {
    options: result.paymentTerms.map((paymentTerm) => ({
      id: paymentTerm.id,
      label:
        paymentTerm.title?.trim() || paymentTerm.description || paymentTerm.id,
      hint: paymentTerm.description || undefined,
    })),
    page: result.page,
  };
}
