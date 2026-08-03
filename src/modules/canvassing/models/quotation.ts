/**
 * What the quote comparison renders. camelCase, ids resolved to names, dates
 * already formatted — amounts stay raw numbers, since formatting money is a
 * render concern.
 */

export interface Quotation {
  id: string;
  /**
   * Shown as-is. The quote carries no vendor join and FastAPI has no by-id read
   * for vendors, so there is no name to render until the backend supplies one.
   */
  vendorId: string;
  referenceNo: string;
  /** Display dates, e.g. "Jul 30". Null only if the backend sent something unparseable. */
  quotedOn: string | null;
  deliveryDate: string | null;
  /** The price this quote puts on the item it was grouped under. */
  unitPrice: number | null;
  /**
   * Carried through unresolved. Payment terms have their own backend endpoint
   * but no module here yet, so nothing can turn this into a name.
   */
  paymentTermId: string;
}

/** One purchase request item and the quotes competing for it. */
export interface ItemQuotations {
  itemId: string;
  name: string;
  quantity: number;
  unit: string | null;
  quotations: Quotation[];
}
