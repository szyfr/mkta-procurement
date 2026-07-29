/**
 * Domain types for the procurement module.
 *
 * Mirrors the entities in the wireframes: purchase requests move Draft →
 * Canvassing / PO Created → Partially Completed → Completed, with Rejected as
 * an off-ramp. Items within a single request can be sourced independently, so
 * status lives on both the request and its individual items.
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
    | "canvassing"
    | "po-created"
    | "partially-completed"
    | "completed"
    | "rejected";

export type PurchaseRequestItemStatus =
    | "pending"
    | "canvassing"
    | "po-created"
    | "delivered"
    | "awaiting-batch";

/** How an item is sourced. Decided automatically, not editable by the requester. */
export type SourcingMode = "direct" | "canvassing" | "pending-item-creation";

export interface PurchaseRequestItem {
    id: string;
    name: string;
    quantity: number;
    unit: string | null;
    estimatedUnitCost: number | null;
    vendor: string | null;
    sourcing: SourcingMode;
    status: PurchaseRequestItemStatus;
    /** Set once the item is delivered, e.g. "Jul 20". */
    deliveredOn?: string;
    /** Canvassing batch this item belongs to, if any. */
    batch?: number;
    /** Shown instead of the catalog picker when the item is not in the catalog. */
    notInCatalog?: boolean;
}

export interface ActivityEntry {
    id: string;
    description: string;
    timestamp: string;
}

export interface Comment {
    id: string;
    author: string;
    body: string;
    timestamp: string;
}

export interface Document {
    id: string;
    name: string;
    date: string;
}

export interface PurchaseRequest {
    id: string;
    /** Null for drafts that have not been titled yet. */
    title: string | null;
    /** True when the title was derived from the items and department. */
    autoTitle?: boolean;
    requester: string;
    department: string;
    amount: number;
    priority: Priority;
    status: PurchaseRequestStatus;
    /** Human label for the status pill, e.g. "PO-3025 Created". */
    statusLabel: string;
    /** Date shown on list rows and cards. Null while still a draft. */
    createdAt: string | null;
    submittedOn?: string;
    completedOn?: string;
    rejectedOn?: string;
    rejectionReason?: string;
    items: PurchaseRequestItem[];
    documents?: Document[];
    comments?: Comment[];
    activity?: ActivityEntry[];
    /** Copy for the right-hand action panel on the detail page. */
    actionPanelNote?: string;
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

export type ItemCreationRequestStatus = "pending" | "approved" | "rejected";

export interface ItemCreationRequest {
    id: string;
    itemName: string;
    /** PR this was requested for, or null for standalone master-data requests. */
    requestedFor: string | null;
    requestedBy: string;
    status: ItemCreationRequestStatus;
    statusLabel: string;
    submittedOn: string;
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
    /**
     * Quotes counted against this batch. Can exceed `quotes.length`: a batch may
     * have a recorded count from before its individual quotes were captured, so
     * counting the rows alone under-reports it.
     */
    quotesReceived: number;
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
