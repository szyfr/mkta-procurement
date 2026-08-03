import type { PageInfo } from "@/lib/api/pagination";
import type { StatusTone } from "@/lib/types";

/**
 * One row of the canvassing list, as the UI renders it.
 *
 * Batch and quote counts are deliberately absent rather than nullable:
 * `GET /canvassing` has no source for them at all, so the table shows those
 * columns empty instead of carrying dead fields around.
 */
export interface CanvassingEntry {
  id: string;
  /** Mongo id of the parent request — what the detail routes take. */
  purchaseRequestId: string;
  /**
   * Human-readable reference, e.g. "PR-2026-0801152847". Null when the request
   * join found nothing, in which case the row falls back to the id.
   */
  purchaseRequestNo: string | null;
  item: string;
  quantity: number;
  unit: string | null;
  /** Already display copy — the backend derives the label per row. */
  status: string;
  statusTone: StatusTone;
  initiatedOn: string | null;
}

export interface CanvassingList {
  entries: CanvassingEntry[];
  page: PageInfo;
}

/**
 * One vendor quotation against a single item, as the comparison table renders
 * it.
 *
 * Two ids stay unresolved because the endpoint joins neither: the vendor —
 * pending a backend join, which is why there is no `vendor` name here — and the
 * payment term. Nothing says whether this quote won either: `canvass_awards`
 * has no read endpoint, so the UI can only highlight the cheapest quote, not
 * the chosen one.
 */
export interface Quote {
  id: string;
  referenceNo: string | null;
  vendorId: string | null;
  /**
   * Null when the quotation carries no pricing entry for this item — better an
   * explicit gap than a wrong ₱0.00.
   */
  unitPrice: number | null;
  /** `unitPrice × quantity`, so null whenever the unit price is. */
  lineTotal: number | null;
  quoteDate: string | null;
  deliveryDate: string | null;
}

/** One purchase request item with every quotation received against it. */
export interface ItemQuotations {
  itemId: string;
  item: string;
  quantity: number;
  unit: string | null;
  quotes: Quote[];
}
