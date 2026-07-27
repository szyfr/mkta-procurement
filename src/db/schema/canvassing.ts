import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

import type { CanvassingStatus } from "@/lib/types";

import { purchaseRequestItems, purchaseRequests } from "./purchase-requests";
import { vendors } from "./reference";

export const canvassingBatches = sqliteTable(
  "canvassing_batches",
  {
    /** Namespaced, e.g. `PR-2026-0113-b2`. */
    id: text("id").primaryKey(),
    purchaseRequestId: text("purchase_request_id")
      .notNull()
      .references(() => purchaseRequests.id, { onDelete: "cascade" }),
    batch: integer("batch").notNull(),
    quotesRequired: integer("quotes_required").notNull().default(3),
    /**
     * Quotes counted for this batch that have no corresponding `vendorQuotes`
     * row. The fixtures record counts (2 of 3 received) for batches whose
     * individual quotes were never written down, so the exposed
     * `quotesReceived` is this baseline plus the real rows. Submitting a quote
     * therefore moves the count without any bookkeeping.
     */
    quotesReceivedBaseline: integer("quotes_received_baseline")
      .notNull()
      .default(0),
    /** True when the 3-quote minimum was waived, e.g. sole-source OEM parts. */
    exempted: integer("exempted", { mode: "boolean" }).notNull().default(false),
    status: text("status").$type<CanvassingStatus>().notNull(),
    statusLabel: text("status_label").notNull(),
    initiatedOn: text("initiated_on").notNull(),
    /**
     * The DTO calls this `selectedVendorId`, but the value it carries is a
     * quote id. The column is named for what it actually holds.
     */
    selectedQuoteId: text("selected_quote_id"),
    selectedOn: text("selected_on"),
  },
  (table) => [
    unique("canvassing_batch_unique").on(table.purchaseRequestId, table.batch),
    index("canvassing_batch_request_idx").on(table.purchaseRequestId),
  ],
);

export const canvassingBatchItems = sqliteTable(
  "canvassing_batch_items",
  {
    batchId: text("batch_id")
      .notNull()
      .references(() => canvassingBatches.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => purchaseRequestItems.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.batchId, table.itemId] })],
);

export const vendorQuotes = sqliteTable(
  "vendor_quotes",
  {
    /**
     * Namespaced as `<batchId>-q<n>`. The fixture ids (`q-1`…`q-7`) are unique
     * only within a single canvassing detail, so they cannot be used directly.
     */
    id: text("id").primaryKey(),
    batchId: text("batch_id")
      .notNull()
      .references(() => canvassingBatches.id, { onDelete: "cascade" }),
    vendorId: text("vendor_id")
      .notNull()
      .references(() => vendors.id),
    total: real("total").notNull(),
    deliveryEstimate: text("delivery_estimate").notNull(),
    quoteDate: text("quote_date").notNull(),
    quoteRef: text("quote_ref"),
    paymentTerms: text("payment_terms"),
    documentName: text("document_name"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("vendor_quotes_batch_idx").on(table.batchId)],
);

/** Per-item unit pricing captured by the quote form. */
export const vendorQuoteLines = sqliteTable(
  "vendor_quote_lines",
  {
    id: text("id").primaryKey(),
    quoteId: text("quote_id")
      .notNull()
      .references(() => vendorQuotes.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => purchaseRequestItems.id, { onDelete: "cascade" }),
    quantity: real("quantity").notNull(),
    unitPrice: real("unit_price").notNull(),
  },
  (table) => [index("vendor_quote_lines_quote_idx").on(table.quoteId)],
);
