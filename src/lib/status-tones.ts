import type {
  CanvassingStatus,
  ItemCreationRequestStatus,
  PurchaseRequestStatus,
  StatusTone,
  UserStatus,
} from "@/lib/types";

/**
 * Status → pill tone. The shared vocabulary for how a status looks.
 *
 * These live outside `src/data` because they are neither fixtures nor records:
 * they are presentation, used by client components and by the server-side
 * mappers that have to put a `statusTone` into a DTO. Keeping one copy avoids
 * the two drifting apart.
 */

export const purchaseRequestTone: Record<PurchaseRequestStatus, StatusTone> = {
  draft: "neutral",
  canvassing: "info",
  "po-created": "ordered",
  "partially-completed": "partial",
  completed: "success",
  rejected: "danger",
};

export const canvassingTone: Record<CanvassingStatus, StatusTone> = {
  "awaiting-quotes": "info",
  "comparison-ready": "neutral",
  "vendor-selected": "success",
  "pending-exemption": "warning",
};

export const itemCreationRequestTone: Record<
  ItemCreationRequestStatus,
  StatusTone
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const userStatusTone: Record<UserStatus, StatusTone> = {
  active: "success",
  invited: "warning",
};

/** Legend shown above the purchase request list. */
export const statusLegend: { label: string; status: PurchaseRequestStatus }[] =
  [
    { label: "Draft", status: "draft" },
    { label: "Canvassing", status: "canvassing" },
    { label: "PO Created", status: "po-created" },
    { label: "Partially Completed", status: "partially-completed" },
    { label: "Completed", status: "completed" },
    { label: "Rejected", status: "rejected" },
  ];
