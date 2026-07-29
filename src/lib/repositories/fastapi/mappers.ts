import { formatShortDate } from "@/lib/format/dates";
import type {
    Priority,
    PurchaseRequest,
    PurchaseRequestItem,
    PurchaseRequestItemStatus,
    PurchaseRequestStatus,
    SourcingMode,
} from "@/types";

import type { FastApiClient } from "./client";
import { departmentName, materialById, vendorName } from "./directory";

/**
 * Upstream documents → the DTO contract in `@/lib/types`.
 *
 * The gap this bridges is wider than a rename. The Mongo document stores a
 * request's identity (title, priority, justification, dates, status) but
 * still lacks amount, submitted/completed date, documents, comments or
 * activity. Those fields are derived or omitted here, and every one of them
 * is a `TODO(backend)`.
 */

export interface PurchaseRequestDoc {
    _id: string;
    title: string | null;
    date_needed: string;
    priority: string;
    status: string;
    justification: string | null;
    requester_id: string | null;
    department_id: string | null;
    created_at: string;
    updated_at: string;
    items?: PurchaseRequestItemDoc[];
}

export interface PurchaseRequestItemDoc {
    _id: string;
    quantity: number;
    status: string;
    is_needs_canvass: boolean | null;
    purchase_request_id: string;
    material_id: string | null;
    vendor_id: string | null;
    /**
     * Present when the aggregation's `$lookup` resolved. It frequently does not:
     * the material sync deletes and recreates documents with fresh `_id`s, which
     * orphans the `material_id` every existing item holds.
     */
    material?: { _id: string; description: string; uom: string } | null;
}

const PRIORITY_BY_UPSTREAM: Record<string, Priority> = {
    low: "Low",
    normal: "Normal",
    high: "High",
};

export function toPriority(value: string | null | undefined): Priority {
    return PRIORITY_BY_UPSTREAM[String(value).toLowerCase()] ?? "Normal";
}

export function toUpstreamPriority(value: Priority | undefined): string {
    return (value ?? "Normal").toLowerCase();
}

const PR_STATUS_BY_UPSTREAM: Record<string, PurchaseRequestStatus> = {
    draft: "draft",
    canvassing: "canvassing",
    "po-created": "po-created",
    "partially-completed": "partially-completed",
    completed: "completed",
    rejected: "rejected",
};

const PR_STATUS_LABEL: Record<PurchaseRequestStatus, string> = {
    draft: "Draft",
    canvassing: "Canvassing",
    "po-created": "PO Created",
    "partially-completed": "Partially Completed",
    completed: "Completed",
    rejected: "Rejected",
};

export function toPurchaseRequestStatus(
    value: string | null | undefined,
): PurchaseRequestStatus {
    return PR_STATUS_BY_UPSTREAM[String(value).toLowerCase()] ?? "draft";
}

const ITEM_STATUS_BY_UPSTREAM: Record<string, PurchaseRequestItemStatus> = {
    pending: "pending",
    canvassing: "canvassing",
    "po-created": "po-created",
    delivered: "delivered",
    "awaiting-batch": "awaiting-batch",
    rejected: "rejected",
};

export function toItemStatus(
    value: string | null | undefined,
): PurchaseRequestItemStatus {
    return ITEM_STATUS_BY_UPSTREAM[String(value).toLowerCase()] ?? "pending";
}

/**
 * `formatShortDate` formats `YYYY-MM-DD` by string manipulation and returns
 * anything else untouched, so an upstream instant has to lose its time part
 * first or it renders raw. Slicing rather than parsing is deliberate — see the
 * timezone note in `@/lib/format/dates`.
 */
export function toIsoDatePart(value: string | null | undefined): string | null {
    if (!value) return null;
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
    return match ? match[1] : null;
}

export function toDisplayDate(value: string | null | undefined): string | null {
    const iso = toIsoDatePart(value);
    return iso === null ? null : formatShortDate(iso);
}

function toSourcing(item: PurchaseRequestItemDoc): SourcingMode {
    // `is_needs_canvass` is copied onto the item at creation from the material,
    // and it is the only sourcing signal the upstream stores.
    return item.is_needs_canvass ? "canvassing" : "direct";
}

export async function toPurchaseRequestItem(
    client: FastApiClient,
    doc: PurchaseRequestItemDoc,
): Promise<PurchaseRequestItem> {
    const material = await materialById(client, doc.material_id);
    const name = material?.name ?? doc.material?.description ?? null;

    return {
        id: doc._id,
        // An orphaned `material_id` leaves nothing to show but the reference
        // itself, which is more useful to a reader than an empty cell.
        name: name ?? `Unknown item (${doc.material_id ?? "no material"})`,
        quantity: doc.quantity,
        unit: material?.unit ?? doc.material?.uom ?? null,
        estimatedUnitCost: material?.unitCost ?? null,
        vendor: await vendorName(client, doc.vendor_id),
        sourcing: toSourcing(doc),
        status: toItemStatus(doc.status),
    };
}

/**
 * The list endpoint returns bare requests — its query does no `$lookup`, so
 * there are no items to price and `amount` is necessarily zero.
 */
export async function toPurchaseRequest(
    client: FastApiClient,
    doc: PurchaseRequestDoc,
    requesterName: string,
): Promise<PurchaseRequest> {
    const items = await Promise.all(
        (doc.items ?? []).map((item) => toPurchaseRequestItem(client, item)),
    );

    const amount = items.reduce(
        (sum, item) => sum + item.quantity * (item.estimatedUnitCost ?? 0),
        0,
    );

    const status = toPurchaseRequestStatus(doc.status);

    return {
        id: doc._id,
        title: doc.title ?? null,
        requester: requesterName,
        department: await departmentName(client, doc.department_id),
        // TODO(backend): no stored amount, and `materials.last_cost` is never
        // synced, so this is zero until Business Central costs land.
        amount,
        priority: toPriority(doc.priority),
        status,
        statusLabel: PR_STATUS_LABEL[status],
        createdAt: toDisplayDate(doc.created_at),
        items,
    };
}
