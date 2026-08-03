import { formatShortDate } from "@/lib/date";
import { canvassingStatusTone } from "@/modules/canvassing/constants";
import type { CanvassingEntryDto } from "@/modules/canvassing/dto";
import type { CanvassingEntry } from "@/modules/canvassing/models/canvassing";

/** DTO → model. Keeps the transformation logic out of the DAL and components. */

export function toCanvassingEntry(dto: CanvassingEntryDto): CanvassingEntry {
  const material = dto.material ?? null;

  return {
    id: dto._id,
    purchaseRequestId: dto.purchase_request_id,
    // The pipeline preserves rows whose request lookup found nothing — fall
    // back to the raw id so such a row still identifies itself.
    purchaseRequestNo:
      dto.purchase_request?.no?.trim() || dto.purchase_request_id,
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
