import { bffRequest } from "@/lib/api/bff-client";
import { canvassingEndpoints } from "@/modules/canvassing/api/endpoints";
import type { AwardQuotationResult } from "@/modules/canvassing/models/award";
import type { CanvassingList } from "@/modules/canvassing/models/canvassing";
import type {
  CreatedQuotation,
  CreateQuotationPayload,
  ItemQuotations,
  QuotationDetail,
} from "@/modules/canvassing/models/quotation";

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

/** One quotation in full, including its attachments. */
export function fetchQuotation(quotationId: string, signal?: AbortSignal) {
  return bffRequest<QuotationDetail>(
    canvassingEndpoints.quotation(quotationId),
    { signal },
  );
}

/**
 * Records a vendor's quote. Goes up as `multipart/form-data` rather than JSON
 * because the upstream endpoint takes attachments; the Route Handler validates
 * the parts and rebuilds them for FastAPI.
 */
export function createQuotation({
  payload,
  attachments = [],
}: {
  payload: CreateQuotationPayload;
  attachments?: File[];
}) {
  const form = new FormData();

  form.set("referenceNo", payload.referenceNo);
  form.set("date", payload.date);
  form.set("deliveryDate", payload.deliveryDate);
  form.set("vendorId", payload.vendorId);
  form.set("paymentTermId", payload.paymentTermId);
  // One part holding JSON, since a form part can only carry a scalar.
  form.set("itemPricing", JSON.stringify(payload.itemPricing));

  for (const attachment of attachments) {
    form.append("attachments", attachment, attachment.name);
  }

  return bffRequest<CreatedQuotation>(canvassingEndpoints.quotations, {
    method: "POST",
    body: form,
  });
}

/**
 * Awards a quotation the items it won. `issues` names any item that already
 * had an award on record for that (purchase request, material) pair — the
 * write for it was refused, not applied, so callers should treat it as a
 * validation failure rather than a partial success.
 */
export function awardQuotation({
  quotationId,
  itemIds,
}: {
  quotationId: string;
  itemIds: string[];
}) {
  return bffRequest<AwardQuotationResult>(
    canvassingEndpoints.award(quotationId),
    { method: "PATCH", body: { items: itemIds } },
  );
}
