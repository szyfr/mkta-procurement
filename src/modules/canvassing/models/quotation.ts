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
  /** The quote this item was awarded to, once `PATCH /canvassing/award/{id}` runs. */
  awardedQuotationId: string | null;
  /**
   * When the award landed. Always null for now — the backend has no
   * dedicated award timestamp, only the item's ordinary `updated_at`, which
   * isn't reliable enough to show as the award date.
   */
  awardedOn: string | null;
}

/** The price one quote puts on one purchase request item. */
export interface QuotationItemPrice {
  itemId: string;
  unitPrice: number;
}

/** One file attached to a quotation. `url` is presigned and time-limited. */
export interface QuotationDocument {
  id: string;
  filename: string;
  url: string;
}

/**
 * The full quotation, for the "view quotation" dialog. Unlike `Quotation`,
 * `itemPricing` isn't unwound to a single item — this is every item the quote
 * prices, since the dialog isn't scoped to one comparison row.
 */
export interface QuotationDetail {
  id: string;
  referenceNo: string;
  vendorId: string;
  paymentTermId: string;
  quotedOn: string | null;
  deliveryDate: string | null;
  itemPricing: QuotationItemPrice[];
  documents: QuotationDocument[];
}

/**
 * What the UI submits to record a quote. The BFF validates this shape before
 * it becomes form parts, so it is shared by the API client and the Route
 * Handler rather than owned by either.
 *
 * Attachments travel alongside it as `File[]` rather than inside it: the
 * payload has to survive being read back out of a `FormData`, and files don't
 * round-trip through that the way scalars do.
 */
export interface CreateQuotationPayload {
  referenceNo: string;
  /** `YYYY-MM-DD`. FastAPI parses these as dates and rejects a time component. */
  date: string;
  deliveryDate: string;
  /** The vendor's Mongo `_id` — not the `vendorId` ERP field of the same name. */
  vendorId: string;
  paymentTermId: string;
  itemPricing: QuotationItemPrice[];
}

/**
 * The create response. It carries no material or vendor join and no documents
 * array, so there is nothing worth rendering — callers refetch the comparison.
 */
export interface CreatedQuotation {
  id: string;
  referenceNo: string;
}
