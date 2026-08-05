import type { QuotationItemPricing } from "@/modules/canvassing/models/quotation";

/**
 * What the UI submits to record a quote — `POST /quotations`, in the field
 * names the endpoint declares.
 *
 * The write is `multipart/form-data` because it accepts attachments, and every
 * scalar is a form part rather than a JSON key. Attachments travel alongside
 * this rather than inside it: the payload has to survive being read back out of
 * a `FormData`, and files don't round-trip through that the way scalars do.
 *
 * There is no response DTO. The endpoint answers with the bare inserted
 * document — the `Quotation` model — and the caller only reads `reference_no`
 * off it before refetching the comparison.
 */
export interface CreateQuotationDto {
  reference_no: string;
  /** `YYYY-MM-DD`. FastAPI parses these as dates and rejects a time component. */
  date: string;
  delivery_date: string;
  /** The vendor's Mongo `_id` — not the `vendor_id` ERP field of the same name. */
  vendor_id: string;
  payment_term_id: string;
  item_pricing: QuotationItemPricing[];
}
