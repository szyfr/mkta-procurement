/**
 * The `PATCH /canvassing/award/{quotation_id}` contract, mirroring FastAPI.
 *
 * The body is plain JSON — `{ items: [...] }`, the ids of the purchase request
 * items the quotation wins — and the response is a **bare array** of the award
 * documents that were inserted, one per item, with no `{ data }` envelope.
 *
 * Nothing on the award points back at the item that produced it: the backend
 * stores the item's request and material instead, so an award is keyed by
 * (purchase request, material) rather than by line.
 */

export interface CanvassAwardDto {
  _id: string;
  quotation_id: string;
  /**
   * Copied from the purchase request *item*, not from the awarded quotation —
   * the endpoint never reads the quote's vendor. See `awardQuotation`.
   */
  vendor_id: string;
  purchase_request_id: string;
  material_id: string;
  created_at: string;
  updated_at: string;
}
