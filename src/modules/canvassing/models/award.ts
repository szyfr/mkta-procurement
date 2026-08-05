/**
 * The `PATCH /canvassing/award/{quotation_id}` response, verbatim.
 *
 * It carries one award document per item that succeeded and, since awards are
 * keyed by (purchase request, material) and a second one is rejected rather
 * than replacing the first, one issue per item that already had an award on
 * record. The award documents carry no joins, so there is nothing to render
 * from them beyond a confirmation that the write landed.
 */

export interface CanvassAward {
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

/** One item the award endpoint refused, and why. Surfaced as UI validation. */
export interface CanvassAwardIssue {
  item_id: string;
  message: string;
}

export interface AwardQuotationResult {
  awards: CanvassAward[];
  issues: CanvassAwardIssue[];
}
