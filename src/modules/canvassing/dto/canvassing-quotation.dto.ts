/**
 * `GET /canvassing/quotations?items=...` — mirrors FastAPI exactly. The
 * `Quotation` schema (`app/schemas/quotation_schema.py`) carries no vendor
 * name and no computed total: `item_pricing` maps a single quotation to a
 * per-item unit price, since one quotation can cover several PR items.
 */

export interface ItemPricingDto {
  item_id: string;
  unit_price: number;
}

export interface QuotationDto {
  _id: string;
  reference_no: string;
  date: string;
  delivery_date: string;
  item_pricing: ItemPricingDto[];
  vendor_id: string;
  payment_term_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * The endpoint actually returns a full `purchase_request_items` row per
 * requested id (quotations plus a non-unwound `material` array), but the
 * caller already has that item from `/purchase-requests/{id}/canvassing` —
 * only `quotations` gets read back out, so only that field is typed.
 */
export interface QuotationsForItemDto {
  _id: string;
  quotations: QuotationDto[];
}
