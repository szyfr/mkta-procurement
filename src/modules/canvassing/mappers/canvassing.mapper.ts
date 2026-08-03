import { formatShortDate } from "@/lib/date";
import { canvassingStatusTone } from "@/modules/canvassing/constants";
import type {
  CanvassingEntryDto,
  ItemQuotationsDto,
  QuotationDto,
} from "@/modules/canvassing/dto";
import type {
  CanvassingEntry,
  ItemQuotations,
  Quote,
} from "@/modules/canvassing/models/canvassing";

/** DTO → model. Keeps the transformation logic out of the DAL and components. */

export function toCanvassingEntry(dto: CanvassingEntryDto): CanvassingEntry {
  const material = dto.material ?? null;

  return {
    id: dto._id,
    purchaseRequestId: dto.purchase_request_id,
    // Same tolerance as the material join — a row without its request still
    // renders, identified by the id it always carries.
    purchaseRequestNo: dto.purchase_request?.no?.trim() || null,
    // The pipeline preserves rows whose material lookup found nothing — fall
    // back to the raw id so such a row still identifies itself.
    item: material?.description?.trim() || dto.material_id,
    quantity: dto.quantity,
    unit: material?.uom || null,
    status: dto.status,
    // The status set is derived in a Mongo pipeline rather than declared as an
    // enum, so a new stage can appear without a schema change; an unrecognized
    // one still renders as a legible neutral pill.
    statusTone: canvassingStatusTone[dto.status] ?? "neutral",
    // The short form the other list rows use, e.g. "Jul 30".
    initiatedOn: formatShortDate(dto.created_at),
  };
}

function toQuote(dto: QuotationDto, itemId: string, quantity: number): Quote {
  // A quotation prices every item it covers, so the row's price is the entry
  // naming this item — position means nothing.
  const pricing = dto.item_pricing.find((entry) => entry.item_id === itemId);
  const unitPrice = pricing?.unit_price ?? null;

  return {
    id: dto._id,
    referenceNo: dto.reference_no?.trim() || null,
    // The pipeline joins no vendor, so this is all there is to show until the
    // backend returns one.
    vendorId: dto.vendor_id,
    unitPrice,
    lineTotal: unitPrice === null ? null : unitPrice * quantity,
    quoteDate: formatShortDate(dto.date),
    deliveryDate: formatShortDate(dto.delivery_date),
  };
}

export function toItemQuotations(dto: ItemQuotationsDto): ItemQuotations {
  const material = dto.material ?? null;

  return {
    itemId: dto._id,
    // Same fallback as the list rows — an item whose material lookup missed is
    // still identifiable by its id.
    item: material?.description?.trim() || dto.material_id,
    quantity: dto.quantity,
    unit: material?.uom || null,
    quotes: dto.quotations.map((quotation) =>
      toQuote(quotation, dto._id, dto.quantity),
    ),
  };
}
