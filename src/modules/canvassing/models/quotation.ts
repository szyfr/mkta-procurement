import type { Material } from "@/modules/purchase-requests";

/**
 * The quotation responses, verbatim.
 *
 * `GET /canvassing/quotations` differs from every other list in the app: it
 * declares no `response_model`, returns raw aggregation output, and answers
 * with a **bare array** rather than the shared `{ data, pagination }` envelope.
 * It takes `items` repeated once per id (`items=a&items=b`).
 */

/** The price one quote puts on one purchase request item. */
export interface QuotationItemPricing {
  item_id: string;
  unit_price: number;
}

/**
 * A vendor's quote. It may price several items at once, which is why the
 * comparison response groups the same quotation under every item it covers.
 *
 * `vendor_id` and `payment_term_id` are carried unresolved: the quote has no
 * vendor join and FastAPI has no by-id read for vendors, and nothing here turns
 * a payment term id into a name either — so the ids are what the UI shows.
 */
export interface Quotation {
  _id: string;
  reference_no: string;
  date: string;
  delivery_date: string;
  item_pricing: QuotationItemPricing[];
  vendor_id: string;
  payment_term_id: string;
  created_at: string;
  updated_at: string;
}

/** One file attached to a quotation. `url` is presigned and time-limited. */
export interface QuotationDocument {
  _id: string;
  filename: string;
  url: string;
}

/**
 * `GET /quotations/{id}` — the only read that carries attachments. The list
 * endpoints never join them, so this is the sole source for a quote's files.
 */
export interface QuotationDetail extends Quotation {
  documents: QuotationDocument[];
}

/**
 * One purchase request item with the quotes that cover it.
 *
 * Unlike `CanvassingEntry`, `status` here is the item's stored status — the
 * list endpoint's derived labels come from a pipeline this one doesn't run, so
 * the two are not interchangeable despite the shared shape.
 */
export interface ItemQuotations {
  _id: string;
  quantity: number;
  status: string;
  is_needs_canvass: boolean | null;
  purchase_request_id: string;
  material_id: string;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
  /**
   * A quotation is attached only if it prices this item, so the array is empty
   * for an item nobody has quoted yet.
   */
  quotations: Quotation[];
  /** The `$unwind` preserves rows whose material lookup missed, dropping the key. */
  material?: Material | null;
  /**
   * The winning quote, set by `PATCH /canvassing/award/{quotation_id}` alongside
   * `status: "quotation-awarded"`. Absent (not just null) on older items awarded
   * before this field existed.
   *
   * There is no award timestamp to go with it — only the item's ordinary
   * `updated_at`, which nothing distinguishes from any other write — so the
   * comparison shows no award date.
   */
  quotation_id?: string | null;
}
