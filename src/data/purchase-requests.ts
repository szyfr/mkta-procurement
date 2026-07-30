import type {
  ItemCreationRequest,
  PurchaseRequestStatus,
  StatusTone,
} from "@/lib/types";

/**
 * Presentation maps for the procurement UI.
 *
 * The purchase request data that used to live here now comes from the backend
 * via `@/modules/purchase-requests`. What remains is either pure presentation
 * (status → tone) or reference data still consumed by modules that haven't been
 * integrated yet — Canvassing and Reports.
 */

/** Status → pill tone. Single source of truth for how a status looks. */
export const purchaseRequestTone: Record<PurchaseRequestStatus, StatusTone> = {
  draft: "neutral",
  pending: "warning",
  canvassing: "info",
  "po-created": "ordered",
  "partially-completed": "partial",
  completed: "success",
  rejected: "danger",
};

/** Legend shown above the purchase request list. */
export const statusLegend: { label: string; status: PurchaseRequestStatus }[] =
  [
    { label: "Draft", status: "draft" },
    { label: "Pending Approval", status: "pending" },
    { label: "Canvassing", status: "canvassing" },
    { label: "PO Created", status: "po-created" },
    { label: "Partially Completed", status: "partially-completed" },
    { label: "Completed", status: "completed" },
    { label: "Rejected", status: "rejected" },
  ];

export const itemCreationRequestTone: Record<
  ItemCreationRequest["status"],
  StatusTone
> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

/**
 * Placeholder reference data for the Canvassing and Reports screens, which are
 * out of scope for the backend integration. The Purchase Requests module reads
 * departments and vendors from the API instead — see
 * `@/modules/purchase-requests` — and no longer imports anything below.
 */
export const departments = [
  "Production",
  "Maintenance",
  "Facilities",
  "Quality",
  "Warehouse",
  "IT",
  "HR / Facilities",
];

export const vendors = [
  "Acme Industrial Supply",
  "Pacific Fasteners Inc.",
  "Del Rosario Trading",
  "Metro Lubricants Corp",
  "Bay Area Electricals",
  "Sunrise Safety Equipment",
];

export const paymentTerms = [
  "Cash on delivery",
  "Net 15",
  "Net 30",
  "Net 60",
  "50% down payment",
];
