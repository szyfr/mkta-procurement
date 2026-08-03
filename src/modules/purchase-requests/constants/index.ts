import type {
  Priority,
  PurchaseRequestItemStatus,
  PurchaseRequestStatus,
  StatusTone,
} from "@/lib/types";
import type { PriorityDto } from "@/modules/purchase-requests/dto";

/** Default page size for the request list. */
export const DEFAULT_PAGE_SIZE = 10;

/** Shared with Canvassing's pickers, so it lives in `@/lib/lookup` now. */
export { LOOKUP_PAGE_SIZE } from "@/lib/lookup";

export const priorityFromDto: Record<PriorityDto, Priority> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export const priorityToDto: Record<Priority, PriorityDto> = {
  Low: "low",
  Normal: "normal",
  High: "high",
};

/**
 * Status pill copy. The backend stores no richer label (no PO number, no item
 * counts), so these are the plain names. Declaration order is the order the
 * legend lists them in.
 */
export const purchaseRequestStatusLabels: Record<
  PurchaseRequestStatus,
  string
> = {
  draft: "Draft",
  pending: "Pending Approval",
  canvassing: "Canvassing",
  "po-created": "PO Created",
  "partially-completed": "Partially Completed",
  completed: "Completed",
  rejected: "Rejected",
  canceled: "Canceled",
};

/**
 * Status → pill tone. Single source of truth for how a request status looks.
 *
 * Canceled shares `neutral` with draft rather than taking `danger`: it's a
 * request withdrawn by its own requester, not a decision made against it.
 */
export const purchaseRequestTone: Record<PurchaseRequestStatus, StatusTone> = {
  draft: "neutral",
  pending: "warning",
  canvassing: "info",
  "po-created": "ordered",
  "partially-completed": "partial",
  completed: "success",
  rejected: "danger",
  canceled: "neutral",
};

/** Legend shown above the request list, derived from the labels above. */
export const purchaseRequestStatusLegend = (
  Object.keys(purchaseRequestStatusLabels) as PurchaseRequestStatus[]
).map((status) => ({ status, label: purchaseRequestStatusLabels[status] }));

export const purchaseRequestItemStatusLabels: Record<
  PurchaseRequestItemStatus,
  string
> = {
  pending: "Pending",
  draft: "Draft",
  canvassing: "Canvassing",
  "po-created": "PO Created",
  "partially-completed": "Partially Completed",
  completed: "Completed",
  rejected: "Rejected",
  canceled: "Canceled",
};

export const purchaseRequestItemTone: Record<
  PurchaseRequestItemStatus,
  StatusTone
> = {
  pending: "neutral",
  draft: "neutral",
  canvassing: "info",
  "po-created": "ordered",
  "partially-completed": "partial",
  completed: "success",
  rejected: "danger",
  canceled: "neutral",
};
