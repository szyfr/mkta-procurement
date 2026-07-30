import type {
  Priority,
  PurchaseRequestItemStatus,
  PurchaseRequestStatus,
  StatusTone,
} from "@/lib/types";
import type { PriorityDto } from "@/modules/purchase-requests/dto";

/** Default page size for the request list. */
export const DEFAULT_PAGE_SIZE = 10;

/** Page size for the create form's material and vendor pickers. */
export const LOOKUP_PAGE_SIZE = 50;

/** FastAPI caps `page_size` at 100. */
export const MAX_PAGE_SIZE = 100;

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
 * counts), so these are the plain names.
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
};

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
};
