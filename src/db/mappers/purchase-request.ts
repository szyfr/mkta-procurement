import { formatShortDate } from "@/lib/format/dates";
import type {
  ActivityEntry,
  Comment,
  Document,
  PurchaseRequest,
  PurchaseRequestItem,
} from "@/types";

import type * as schema from "../schema";

type RequestRow = typeof schema.purchaseRequests.$inferSelect;
type ItemRow = typeof schema.purchaseRequestItems.$inferSelect;
type DocumentRow = typeof schema.purchaseRequestDocuments.$inferSelect;
type CommentRow = typeof schema.purchaseRequestComments.$inferSelect;
type ActivityRow = typeof schema.purchaseRequestActivity.$inferSelect;

/** An item row with its vendor name resolved by the query's join. */
export type ItemRowWithVendor = ItemRow & { vendorName: string | null };

export interface PurchaseRequestParts {
  request: RequestRow;
  items: ItemRowWithVendor[];
  documents?: DocumentRow[];
  comments?: CommentRow[];
  activity?: ActivityRow[];
}

const date = (value: string | null) =>
  value === null ? undefined : formatShortDate(value);

/**
 * Empty child collections are dropped rather than returned as `[]`.
 *
 * The DTO marks them optional and the detail page keys off their presence to
 * decide whether to render a section at all, so an empty array and an absent
 * key are not interchangeable.
 */
function optionalList<T>(items: T[] | undefined): T[] | undefined {
  return items && items.length > 0 ? items : undefined;
}

export function toPurchaseRequestItem(
  row: ItemRowWithVendor,
): PurchaseRequestItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    estimatedUnitCost: row.estimatedUnitCost,
    vendor: row.vendorName,
    sourcing: row.sourcing,
    status: row.status,
    ...(row.deliveredOn
      ? { deliveredOn: formatShortDate(row.deliveredOn) }
      : {}),
    ...(row.batch === null ? {} : { batch: row.batch }),
    ...(row.notInCatalog ? { notInCatalog: true } : {}),
  };
}

function toDocument(row: DocumentRow): Document {
  return { id: row.id, name: row.name, date: formatShortDate(row.date) };
}

function toComment(row: CommentRow): Comment {
  return {
    id: row.id,
    author: row.author,
    body: row.body,
    timestamp: formatShortDate(row.createdOn),
  };
}

function toActivity(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    description: row.description,
    timestamp: formatShortDate(row.occurredOn),
  };
}

export function toPurchaseRequest(
  parts: PurchaseRequestParts,
): PurchaseRequest {
  const { request } = parts;

  return {
    id: request.id,
    title: request.title,
    ...(request.autoTitle ? { autoTitle: true } : {}),
    requester: request.requester,
    department: request.department,
    amount: request.amount,
    priority: request.priority,
    status: request.status,
    statusLabel: request.statusLabel,
    createdAt:
      request.createdAt === null ? null : formatShortDate(request.createdAt),
    ...(request.submittedOn ? { submittedOn: date(request.submittedOn) } : {}),
    ...(request.completedOn ? { completedOn: date(request.completedOn) } : {}),
    ...(request.rejectedOn ? { rejectedOn: date(request.rejectedOn) } : {}),
    ...(request.rejectionReason
      ? { rejectionReason: request.rejectionReason }
      : {}),
    items: parts.items.map(toPurchaseRequestItem),
    ...(optionalList(parts.documents)
      ? { documents: parts.documents?.map(toDocument) }
      : {}),
    ...(optionalList(parts.comments)
      ? { comments: parts.comments?.map(toComment) }
      : {}),
    ...(optionalList(parts.activity)
      ? { activity: parts.activity?.map(toActivity) }
      : {}),
    ...(request.actionPanelNote
      ? { actionPanelNote: request.actionPanelNote }
      : {}),
  };
}
