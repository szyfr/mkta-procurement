/**
 * What an award looks like once recorded. camelCase, ids left unresolved — the
 * response carries no joins, so there is nothing to render from it beyond a
 * confirmation that the write landed.
 */

export interface CanvassAward {
  id: string;
  quotationId: string;
  /** The item's stored vendor, which is what the backend awards. */
  vendorId: string;
  purchaseRequestId: string;
  materialId: string;
}
