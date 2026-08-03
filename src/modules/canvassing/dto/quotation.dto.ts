import type { CanvassingMaterialDto } from "@/modules/canvassing/dto/canvassing.dto";

/**
 * The `GET /canvassing/quotations` contract, mirroring FastAPI exactly.
 *
 * Two things about this endpoint differ from every other list in the app:
 * it declares no `response_model` and returns raw aggregation output, and it
 * answers with a **bare array** rather than the shared `{ data, pagination }`
 * envelope. It takes `items` repeated once per id (`items=a&items=b`).
 */

export interface QuotationItemPricingDto {
  item_id: string;
  unit_price: number;
}

/**
 * A vendor's quote. It may price several items at once, which is why the
 * response groups the same quotation under every item it covers.
 *
 * `reference_no`, `date`, `delivery_date`, `vendor_id` and `payment_term_id`
 * are all required on create, so none of them arrive null in practice.
 */
export interface QuotationDto {
  _id: string;
  reference_no: string;
  date: string;
  delivery_date: string;
  item_pricing: QuotationItemPricingDto[];
  vendor_id: string;
  payment_term_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * One purchase request item with the quotes that cover it.
 *
 * Unlike `CanvassingEntryDto`, `status` here is the item's stored status — the
 * list endpoint's derived labels come from a pipeline this one doesn't run, so
 * the two are not interchangeable despite the shared shape.
 */
export interface ItemQuotationsDto {
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
  quotations: QuotationDto[];
  /** The `$unwind` preserves rows whose material lookup missed, dropping the key. */
  material?: CanvassingMaterialDto | null;
}
