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
 * The parent request joined onto each row, restated rather than imported —
 * see `CanvassingMaterialDto` above for why. Only the fields the list needs
 * are declared; the full request contract lives in the `purchase-requests`
 * module.
 */
export interface CanvassingPurchaseRequestDto {
  _id: string;
  no: string;
}

/**
 * One canvassing row: a purchase request item out for quotation, with its
 * material joined in.
 *
 * The pipeline looks up the item's awards and quotations only to derive
 * `status`, then projects both away — so a row carries no quote counts, no
 * batch number and no department, and the list cannot show them yet.
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
  /** Joined by the list pipeline, preserving rows whose request is missing. */
  purchase_request?: CanvassingPurchaseRequestDto | null;
}
