import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import type {
  ItemCreationRequestStatus,
  Priority,
  PurchaseRequestItemStatus,
  PurchaseRequestStatus,
  SourcingMode,
  StatusTone,
} from "@/lib/types";

import { catalogItems, departments, vendors } from "./reference";
import { users } from "./users";

/**
 * Date-only values are stored as TEXT `YYYY-MM-DD` rather than epoch integers.
 * The UI renders them as "Jul 20", and formatting an instant through a local
 * timezone can shift the calendar day; a plain date string cannot.
 */
export const purchaseRequests = sqliteTable(
  "purchase_requests",
  {
    id: text("id").primaryKey(),
    /** Null for drafts that have not been titled yet. */
    title: text("title"),
    autoTitle: integer("auto_title", { mode: "boolean" })
      .notNull()
      .default(false),
    /** Display name. Not every requester is a user row ("Warehouse Team"). */
    requester: text("requester").notNull(),
    requesterUserId: text("requester_user_id").references(() => users.id),
    department: text("department")
      .notNull()
      .references(() => departments.name),
    /**
     * Stored, not derived. Only 4 of the 10 seeded requests have an `amount`
     * equal to the sum of their line items, so recomputing it would silently
     * change the figures the UI is specified to show.
     */
    amount: real("amount").notNull(),
    priority: text("priority").$type<Priority>().notNull(),
    status: text("status").$type<PurchaseRequestStatus>().notNull(),
    statusLabel: text("status_label").notNull(),
    createdAt: text("created_at"),
    submittedOn: text("submitted_on"),
    completedOn: text("completed_on"),
    rejectedOn: text("rejected_on"),
    rejectionReason: text("rejection_reason"),
    actionPanelNote: text("action_panel_note"),
    /**
     * The dashboard's "Requests Requiring Action" step and its tone are not a
     * function of `status` — they diverge from both `statusLabel` and the
     * status→tone map in the fixtures, so they get their own columns. A row
     * with a null `actionStep` does not appear on the dashboard.
     */
    actionStep: text("action_step"),
    actionStepTone: text("action_step_tone").$type<StatusTone>(),
    /** Position in the dashboard's action list, which is also hand-ordered. */
    actionOrder: integer("action_order"),
    /**
     * Hand-curated wireframe ordering for the list pages, not a sort key that
     * can be recomputed. Rows with a null `listOrder` are excluded from the
     * default list view.
     */
    listOrder: integer("list_order"),
  },
  (table) => [
    index("pr_status_idx").on(table.status),
    index("pr_department_idx").on(table.department),
    index("pr_list_order_idx").on(table.listOrder),
  ],
);

export const purchaseRequestItems = sqliteTable(
  "purchase_request_items",
  {
    id: text("id").primaryKey(),
    purchaseRequestId: text("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    quantity: real("quantity").notNull(),
    unit: text("unit"),
    estimatedUnitCost: real("estimated_unit_cost"),
    vendorId: text("vendor_id").references(() => vendors.id),
    catalogItemId: text("catalog_item_id").references(() => catalogItems.id),
    sourcing: text("sourcing").$type<SourcingMode>().notNull(),
    status: text("status").$type<PurchaseRequestItemStatus>().notNull(),
    deliveredOn: text("delivered_on"),
    /** Canvassing batch number this item belongs to, if any. */
    batch: integer("batch"),
    notInCatalog: integer("not_in_catalog", { mode: "boolean" })
      .notNull()
      .default(false),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("pr_items_request_idx").on(table.purchaseRequestId)],
);

export const purchaseRequestDocuments = sqliteTable(
  "pr_documents",
  {
    id: text("id").primaryKey(),
    purchaseRequestId: text("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    date: text("date").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("pr_documents_request_idx").on(table.purchaseRequestId)],
);

export const purchaseRequestComments = sqliteTable(
  "pr_comments",
  {
    id: text("id").primaryKey(),
    purchaseRequestId: text("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    body: text("body").notNull(),
    createdOn: text("created_on").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("pr_comments_request_idx").on(table.purchaseRequestId)],
);

export const purchaseRequestActivity = sqliteTable(
  "pr_activity",
  {
    id: text("id").primaryKey(),
    purchaseRequestId: text("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    occurredOn: text("occurred_on").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("pr_activity_request_idx").on(table.purchaseRequestId)],
);

/**
 * `requestedFor` is deliberately a plain string with no foreign key: the
 * fixtures reference PR-2026-0110, which does not exist as a request.
 */
export const itemCreationRequests = sqliteTable("item_creation_requests", {
  id: text("id").primaryKey(),
  itemName: text("item_name").notNull(),
  requestedFor: text("requested_for"),
  requestedBy: text("requested_by").notNull(),
  status: text("status").$type<ItemCreationRequestStatus>().notNull(),
  statusLabel: text("status_label").notNull(),
  submittedOn: text("submitted_on").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
