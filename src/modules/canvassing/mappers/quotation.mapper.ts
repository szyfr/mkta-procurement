import { formatShortDate } from "@/lib/date";
import type {
  ItemQuotationsDto,
  QuotationDetailDto,
  QuotationDto,
} from "@/modules/canvassing/dto";
import type {
  CreatedQuotation,
  ItemQuotations,
  Quotation,
  QuotationDetail,
} from "@/modules/canvassing/models/quotation";

/** DTO → model for the quote comparison. */

export function toQuotation(dto: QuotationDto, itemId: string): Quotation {
  return {
    id: dto._id,
    referenceNo: dto.reference_no,
    vendorId: dto.vendor_id,
    quotedOn: formatShortDate(dto.date),
    deliveryDate: formatShortDate(dto.delivery_date),
    // The join attaches a quotation to an item only when it prices it, so this
    // should always hit; a missing price renders as unquoted rather than zero.
    unitPrice:
      dto.item_pricing.find((pricing) => pricing.item_id === itemId)
        ?.unit_price ?? null,
    paymentTermId: dto.payment_term_id,
  };
}

export function toItemQuotations(dto: ItemQuotationsDto): ItemQuotations {
  const material = dto.material ?? null;

  return {
    itemId: dto._id,
    // The material lookup can miss; the raw id still identifies the row.
    name: material?.description?.trim() || dto.material_id,
    quantity: dto.quantity,
    unit: material?.uom || null,
    quotations: dto.quotations.map((quotation) =>
      toQuotation(quotation, dto._id),
    ),
    awardedQuotationId: dto.quotation_id ?? null,
    // `updated_at` isn't a real award timestamp — it's just whatever last
    // touched the item, and nothing upstream distinguishes an award from any
    // other write. Null until the backend adds a dedicated field.
    awardedOn: null,
  };
}

/**
 * The create response is the raw inserted document — no envelope, no joins.
 * Only enough of it is kept to confirm the write; the comparison table refetches.
 */
export function toCreatedQuotation(dto: QuotationDto): CreatedQuotation {
  return { id: dto._id, referenceNo: dto.reference_no };
}

export function toQuotationDetail(dto: QuotationDetailDto): QuotationDetail {
  return {
    id: dto._id,
    referenceNo: dto.reference_no,
    vendorId: dto.vendor_id,
    paymentTermId: dto.payment_term_id,
    quotedOn: formatShortDate(dto.date),
    deliveryDate: formatShortDate(dto.delivery_date),
    itemPricing: dto.item_pricing.map((pricing) => ({
      itemId: pricing.item_id,
      unitPrice: pricing.unit_price,
    })),
    documents: dto.documents.map((document) => ({
      id: document._id,
      filename: document.filename,
      url: document.url,
    })),
  };
}
