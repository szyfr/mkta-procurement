import { formatShortDate } from "@/lib/date";
import { canvassingStatusTone } from "@/modules/canvassing/constants";
import type {
  CanvassingEntryDto,
  PurchaseRequestCanvassingItemDto,
  QuotationDto,
  VendorDto,
} from "@/modules/canvassing/dto";
import type {
  CanvassingEntry,
  CanvassingQuotation,
  PurchaseRequestCanvassingItem,
} from "@/modules/canvassing/models/canvassing";

/** DTO → model. Keeps the transformation logic out of the DAL and components. */

/** id → display name, so a vendor id can be resolved without a lookup per row. */
export type NameLookup = ReadonlyMap<string, string>;

export function toVendorLookup(vendors: VendorDto[]): NameLookup {
  return new Map(vendors.map((vendor) => [vendor._id, vendorName(vendor)]));
}

/** Some synced vendors have a blank name; their number is the next best label. */
function vendorName(vendor: VendorDto) {
  return vendor.name.trim() || vendor.no;
}

export function toCanvassingEntry(dto: CanvassingEntryDto): CanvassingEntry {
  const material = dto.material ?? null;

  return {
    id: dto._id,
    purchaseRequestId: dto.purchase_request_id,
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

export function toCanvassingQuotation(
  dto: QuotationDto,
  item: PurchaseRequestCanvassingItemDto,
  vendors: NameLookup,
): CanvassingQuotation {
  // A quotation can price several items; only this item's own entry matters.
  const pricing = dto.item_pricing.find((entry) => entry.item_id === item._id);
  const unitPrice = pricing?.unit_price ?? 0;

  return {
    id: dto._id,
    vendorId: dto.vendor_id,
    vendor: vendors.get(dto.vendor_id) ?? dto.vendor_id,
    referenceNo: dto.reference_no,
    date: formatShortDate(dto.date),
    deliveryDate: formatShortDate(dto.delivery_date),
    unitPrice,
    total: unitPrice * item.quantity,
  };
}

export function toPurchaseRequestCanvassingItem(
  dto: PurchaseRequestCanvassingItemDto,
  quotationDtos: QuotationDto[],
  vendors: NameLookup,
): PurchaseRequestCanvassingItem {
  const material = dto.material ?? null;

  return {
    id: dto._id,
    materialId: dto.material_id,
    item: material?.description?.trim() || dto.material_id,
    unit: material?.uom || null,
    quantity: dto.quantity,
    status: dto.status,
    vendorId: dto.vendor_id,
    quotations: quotationDtos.map((quotation) =>
      toCanvassingQuotation(quotation, dto, vendors),
    ),
  };
}
