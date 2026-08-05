import { bffRequest } from "@/lib/api/bff-client";
import type { Paginated } from "@/lib/api/pagination";
import { canvassingEndpoints } from "@/modules/canvassing/api/endpoints";
import type { CreateQuotationDto } from "@/modules/canvassing/dto";
import type { AwardQuotationResult } from "@/modules/canvassing/models/award";
import type { CanvassingEntry } from "@/modules/canvassing/models/canvassing";
import type {
  ItemQuotations,
  Quotation,
  QuotationDetail,
} from "@/modules/canvassing/models/quotation";

/**
 * Canvassing calls against the BFF. Runs in the browser and knows nothing about
 * FastAPI's address — Route Handlers pass the upstream response through
 * untouched. The transport itself lives in `lib/api/bff-client`.
 */

export interface ListCanvassingParams {
  page?: number;
  signal?: AbortSignal;
}

export function fetchCanvassing({ page, signal }: ListCanvassingParams = {}) {
  return bffRequest<Paginated<CanvassingEntry>>(canvassingEndpoints.list, {
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
 * because the upstream endpoint takes attachments, and the parts carry the
 * upstream's own field names — the Route Handler validates them and passes
 * them straight on.
 */
export function createQuotation({
  payload,
  attachments = [],
}: {
  payload: CreateQuotationDto;
  attachments?: File[];
}) {
  const form = new FormData();

  form.set("reference_no", payload.reference_no);
  form.set("date", payload.date);
  form.set("delivery_date", payload.delivery_date);
  form.set("vendor_id", payload.vendor_id);
  form.set("payment_term_id", payload.payment_term_id);
  // One part holding JSON, since a form part can only carry a scalar.
  form.set("item_pricing", JSON.stringify(payload.item_pricing));

  for (const attachment of attachments) {
    form.append("attachments", attachment, attachment.name);
  }

  return bffRequest<Quotation>(canvassingEndpoints.quotations, {
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
