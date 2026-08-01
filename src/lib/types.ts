/**
 * Domain types for the procurement module.
 *
 * Mirrors the entities in the wireframes: purchase requests move Draft →
 * Pending → Canvassing / PO Created → Partially Completed → Completed, with
 * Rejected and Canceled as off-ramps. Items within a single request can be
 * sourced independently, so status lives on both the request and its
 * individual items.
 */

/** Visual tone shared by every status pill in the app. */
export type StatusTone =
  | "neutral"
  | "info"
  | "ordered"
  | "partial"
  | "success"
  | "warning"
  | "danger";

export type Priority = "High" | "Normal" | "Low";

export type PurchaseRequestStatus =
  | "draft"
  | "pending"
  | "canvassing"
  | "po-created"
  | "partially-completed"
  | "completed"
  | "rejected"
  | "canceled";

/**
 * Items carry a wider set of states than their parent request, because a
 * single item can be rejected or completed while the rest of the request moves
 * on. Mirrors `Status` in the backend's purchase_request_item schema.
 */
export type PurchaseRequestItemStatus =
  | "pending"
  | "draft"
  | "canvassing"
  | "po-created"
  | "partially-completed"
  | "completed"
  | "rejected"
  | "canceled";

/**
 * How an item is sourced. Derived from the material's `is_needs_canvass` flag,
 * not editable by the requester.
 */
export type SourcingMode = "direct" | "canvassing";

export interface PurchaseRequestItem {
  id: string;
  materialId: string;
  name: string;
  quantity: number;
  unit: string | null;
  /** Null whenever the material has no cost on file, which is currently always. */
  estimatedUnitCost: number | null;
  vendorId: string | null;
  vendor: string | null;
  sourcing: SourcingMode;
  status: PurchaseRequestItemStatus;
}

export interface ActivityEntry {
  id: string;
  description: string;
  timestamp: string;
}

/**
 * A purchase request as the UI renders it.
 *
 * Several fields the wireframe imagined have no backend source and are
 * deliberately absent rather than invented: submitted/completed/rejected
 * dates, rejection reasons, documents, comments and activity history. The
 * panels that would show them stay hidden until the endpoints exist.
 */
export interface PurchaseRequest {
  id: string;
  /** Human-readable request number, e.g. "PR-0042". */
  no: string;
  /** Null for drafts that have not been titled yet. */
  title: string | null;
  requester: string;
  department: string;
  departmentId: string;
  /**
   * Null when the total can't be established — no amount is stored on the
   * request and materials currently sync without a cost.
   */
  amount: number | null;
  priority: Priority;
  status: PurchaseRequestStatus;
  /** Human label for the status pill, e.g. "PO-3025 Created". */
  statusLabel: string;
  /** Why the purchase is needed, as entered by the requester. */
  justification: string;
  /** When the requester needs the items, e.g. "Aug 17". */
  dateNeeded: string | null;
  /** `dateNeeded` reformatted for a date input's `value`, e.g. "2026-08-17". */
  dateNeededValue: string;
  /** Date shown on list rows and cards. Null while still a draft. */
  createdAt: string | null;
  items: PurchaseRequestItem[];
}

/** A row on the dashboard's "Requests Requiring Action" table. */
export interface ActionableRequest {
  id: string;
  requester: string;
  department: string;
  amount: number;
  step: string;
  stepTone: StatusTone;
  priority: Priority;
}

export interface PendingQuotation {
  id: string;
  summary: string;
  detail: string;
}

export interface Deadline {
  id: string;
  label: string;
  due: string;
  overdue?: boolean;
}

export type CanvassingStatus =
  | "awaiting-quotes"
  | "comparison-ready"
  | "vendor-selected"
  | "pending-exemption";

export interface CanvassingCase {
  id: string;
  purchaseRequestId: string;
  item: string;
  batch: number;
  department: string;
  quotesReceived: number;
  quotesRequired: number;
  /** True when the 3-quote minimum was waived, e.g. sole-source OEM parts. */
  exempted?: boolean;
  status: CanvassingStatus;
  statusLabel: string;
  initiatedOn: string;
}

export interface VendorQuote {
  id: string;
  vendor: string;
  total: number;
  deliveryEstimate: string;
  quoteDate: string;
}

export interface CanvassingBatch {
  batch: number;
  items: { id: string; name: string; quantity: number }[];
  quotes: VendorQuote[];
  quotesRequired: number;
  /** Set once a winner is confirmed. */
  selectedVendorId?: string;
  selectedOn?: string;
}

export interface CanvassingDetail {
  purchaseRequestId: string;
  department: string;
  /** Every item on the PR, including ones not yet assigned to a batch. */
  items: {
    id: string;
    name: string;
    quantity: number;
    batch: number | null;
    status: string;
    statusTone: StatusTone;
  }[];
  batches: CanvassingBatch[];
}

export type NotificationGroup = "today" | "earlier";

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  group: NotificationGroup;
  read: boolean;
  href: string;
}

export type SearchResultType =
  | "Purchase Requests"
  | "Purchase Orders"
  | "Items"
  | "Vendors";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  label: string;
  detail: string;
  badge?: string;
  badgeTone?: StatusTone;
  href: string;
}

export type UserStatus = "active" | "invited";

export interface User {
  id: string;
  name: string;
  role: string;
  department: string;
  status: UserStatus;
  /** True for the signed-in user, who cannot edit their own row here. */
  isCurrentUser?: boolean;
}

export interface RolePermission {
  role: string;
  description: string;
}
