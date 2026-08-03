/**
 * Response contracts, mirroring FastAPI exactly — snake_case, `_id` keys.
 * These never reach React components; the mapper converts them to models
 * first. The pagination envelope they arrive in is shared — see
 * `lib/api/pagination`.
 */

/**
 * `GET /canvassing` does not return the item's stored status. The aggregation
 * matches on `status: "canvassing"` and then overwrites the field with a
 * derived label describing how far sourcing has got — an award exists, some
 * quotation exists, or neither (`get_for_canvassing_list` in
 * `app/models/purchase_request_item.py`). So these are display strings, not
 * the item `Status` enum, and there is no slug to map them from.
 */
export type CanvassingStatusDto =
  | "Awaiting Quotation"
  | "Ready for Comparison"
  | "Vendor Selected";

/**
 * The material joined onto each row. Materials have no module of their own
 * yet, and a module never reads another module's DTOs, so the upstream
 * contract is restated here rather than imported across the boundary.
 */
export interface CanvassingMaterialDto {
  _id: string;
  no: string;
  description: string;
  inventory: number;
  uom: string;
  inv_post_grp: string;
  is_needs_canvass: boolean;
  /** Declared by the backend schema but absent from every synced material. */
  last_cost?: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * The parent request joined onto each row. Restated here for the same reason
 * as the material above — the Purchase Requests module owns its own DTO, and
 * modules don't read each other's contracts.
 *
 * Only the fields the list actually reads are declared; the join carries the
 * whole request document.
 */
export interface CanvassingPurchaseRequestDto {
  _id: string;
  /** Human-readable reference, e.g. "PR-2026-0801152847". */
  no: string;
  title: string | null;
  status: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * One canvassing row: a purchase request item out for quotation, with its
 * material and parent request joined in.
 *
 * The pipeline looks up the item's awards and quotations only to derive
 * `status`, then projects both away — so a row carries no quote counts and no
 * batch number, and the list cannot show them yet.
 */
export interface CanvassingEntryDto {
  _id: string;
  quantity: number;
  status: CanvassingStatusDto;
  is_needs_canvass: boolean | null;
  purchase_request_id: string;
  material_id: string;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
  /** Joined by the list pipeline, preserving rows whose material is missing. */
  material?: CanvassingMaterialDto | null;
  /** Joined the same way, so a row can arrive without its request. */
  purchase_request?: CanvassingPurchaseRequestDto | null;
}

/**
 * A quotation prices several items at once, so the unit price for one item is
 * found by matching this entry's `item_id` — not by position.
 */
export interface QuotationItemPricingDto {
  item_id: string;
  unit_price: number;
}

/**
 * One vendor quotation. The pipeline joins nothing onto it: `vendor_id` and
 * `payment_term_id` arrive as bare ids, and there is no award flag saying
 * whether this quotation won.
 */
export interface QuotationDto {
  _id: string;
  reference_no: string | null;
  /** When the vendor quoted. */
  date: string | null;
  delivery_date: string | null;
  item_pricing: QuotationItemPricingDto[];
  vendor_id: string | null;
  payment_term_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * One entry of `GET /canvassing/quotations` — a purchase request item with its
 * quotations and material joined.
 *
 * Unlike every other list endpoint this one answers with a bare array, not the
 * `{ data, pagination }` envelope, so there is no `PaginatedDto` here.
 */
export interface ItemQuotationsDto {
  _id: string;
  quantity: number;
  /** The item's stored status, not the derived canvassing label. */
  status: string;
  is_needs_canvass: boolean | null;
  purchase_request_id: string;
  material_id: string;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
  /** Empty for an item nobody has quoted yet. */
  quotations: QuotationDto[];
  material?: CanvassingMaterialDto | null;
}
