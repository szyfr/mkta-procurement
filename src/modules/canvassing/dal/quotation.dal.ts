import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import type { ItemQuotationsDto, QuotationDto } from "@/modules/canvassing/dto";
import {
  toCreatedQuotation,
  toItemQuotations,
} from "@/modules/canvassing/mappers/quotation.mapper";
import type {
  CreatedQuotation,
  CreateQuotationPayload,
  ItemQuotations,
} from "@/modules/canvassing/models/quotation";

/**
 * Quote reads and writes against FastAPI. Server-side only, called from Route
 * Handlers — never from a component.
 *
 * The read hangs off `/canvassing`, but quotations are their own top-level
 * router upstream, so the write posts to `/quotations` instead.
 */

const NOT_FOUND = "We couldn't find that item.";

/**
 * The quotes covering each of the given purchase request items.
 *
 * `items` repeats once per id upstream. The response is a bare array, not the
 * paginated envelope the other lists use, and it comes back in whatever order
 * the aggregation produced — callers that care about order should sort.
 */
export async function listItemQuotations(
  itemIds: string[],
): Promise<ItemQuotations[]> {
  // Asking for nothing is a legitimate state: a request whose items all source
  // directly has no ids to send.
  if (itemIds.length === 0) return [];

  for (const itemId of itemIds) assertObjectId(itemId, NOT_FOUND);

  const dtos = await serverFetch<ItemQuotationsDto[]>(
    "/canvassing/quotations",
    {
      query: { items: itemIds },
    },
  );

  return dtos.map(toItemQuotations);
}

/**
 * Records a vendor's quote for one or more items.
 *
 * The endpoint is `multipart/form-data` because it accepts attachments, and
 * every scalar is a form part rather than a JSON key. Two of its quirks are
 * worth naming: `item_pricing` is a JSON *string* inside a single part — not
 * repeated fields and not bracket notation — and the path must not carry a
 * trailing slash, which would earn a 307 instead of a write.
 *
 * The form is rebuilt from the validated payload rather than forwarded from
 * the Route Handler, so nothing reaches FastAPI that hasn't been checked.
 */
export async function createQuotation(
  payload: CreateQuotationPayload,
  attachments: File[] = [],
): Promise<CreatedQuotation> {
  const form = new FormData();

  form.set("reference_no", payload.referenceNo);
  form.set("date", payload.date);
  form.set("delivery_date", payload.deliveryDate);
  form.set("vendor_id", payload.vendorId);
  form.set("payment_term_id", payload.paymentTermId);
  form.set(
    "item_pricing",
    JSON.stringify(
      payload.itemPricing.map((price) => ({
        item_id: price.itemId,
        unit_price: price.unitPrice,
      })),
    ),
  );

  for (const attachment of attachments) {
    form.append("attachments", attachment, attachment.name);
  }

  // Answers 200 with the bare inserted document — no `{ data }` envelope and
  // no uploaded-document list, so there is nothing else to read back.
  const dto = await serverFetch<QuotationDto>("/quotations", {
    method: "POST",
    body: form,
  });

  return toCreatedQuotation(dto);
}
