import type { Material } from "@/modules/purchase-requests";

/**
 * The `GET /canvassing` response, verbatim. List responses arrive inside the
 * shared pagination envelope, see `lib/api/pagination`.
 *
 * Batch, department and quote counts are absent because the pipeline has no
 * source for them at all: it looks up an item's awards and quotations only to
 * derive `status`, then projects both away, and joins neither the department
 * nor a count. The table shows those columns empty rather than carrying dead
 * fields around.
 */

/**
 * `GET /canvassing` does not return the item's stored status. The aggregation
 * matches on `status: "canvassing"` and then overwrites the field with a
 * derived label describing how far sourcing has got — an award exists, some
 * quotation exists, or neither (`get_for_canvassing_list` in
 * `app/models/purchase_request_item.py`). So these are display strings already,
 * not the item `Status` enum, and there is no slug to map them from.
 */
export type CanvassingStatus =
  | "Awaiting Quotation"
  | "Ready for Comparison"
  | "Vendor Selected";

/** The parent request joined onto each row — only `no` is projected. */
export interface CanvassingPurchaseRequest {
  _id: string;
  no: string;
}

/** One canvassing row: a purchase request item out for quotation. */
export interface CanvassingEntry {
  _id: string;
  quantity: number;
  status: CanvassingStatus;
  is_needs_canvass: boolean | null;
  purchase_request_id: string;
  material_id: string;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
  /** Joined by the list pipeline, preserving rows whose material is missing. */
  material?: Material | null;
  /** Joined by the list pipeline, preserving rows whose request is missing. */
  purchase_request?: CanvassingPurchaseRequest | null;
}
