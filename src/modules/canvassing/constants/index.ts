import type { StatusTone } from "@/lib/types";
import type { CanvassingStatusDto } from "@/modules/canvassing/dto";

/** Default page size for the canvassing list. */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Status → pill tone. There is no matching label map: the backend derives each
 * row's status and sends the finished copy, so the value *is* the label.
 *
 * Declaration order is sourcing order, which is the order the filter lists them
 * in. Tones match the ones the mock list used for the equivalent stages.
 */
export const canvassingStatusTone: Record<CanvassingStatusDto, StatusTone> = {
  "Awaiting Quotation": "info",
  "Ready for Comparison": "neutral",
  "Vendor Selected": "success",
};

/** The statuses a row can carry, for the Status filter. */
export const canvassingStatusOptions = Object.keys(
  canvassingStatusTone,
) as CanvassingStatusDto[];
