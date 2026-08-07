/**
 * `POST /purchase-request-proofs` response, verbatim. One proof record can
 * cover several items — `purchase_request_item_ids` is how the backend groups
 * a single vendor confirmation across a PO's lines, the same grouping the
 * bulk dialog uses client-side.
 *
 * The detail pipeline (`purchase_request.py:get_full_details`) `$lookup`s
 * every proof touching one of the request's items onto `PurchaseRequest.proofs`
 * — but only this shape, not the S3-backed document list. That join only
 * happens on `GET /purchase-request-proofs/{id}`, which this app doesn't call,
 * so a proof's filename is known only for the session that just uploaded it.
 */
export interface PurchaseRequestProof {
  _id: string;
  /** `YYYY-MM-DD`. */
  delivery_date: string;
  vendor_reference_no: string;
  purchase_request_item_ids: string[];
  created_at: string;
  updated_at: string;
}
