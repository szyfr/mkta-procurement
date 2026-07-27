import {
  index,
  integer,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { purchaseRequestItems, purchaseRequests } from "./purchase-requests";
import { vendors } from "./reference";

/**
 * Purchase orders exist only inside free text in the fixtures ("PO-3025
 * Created", "PO-3025.pdf", search rows). Modelling them lets a PO number be
 * derived rather than hardcoded, and gives vendor selection something to write.
 */
export const purchaseOrders = sqliteTable(
  "purchase_orders",
  {
    /** The PO number itself, e.g. `PO-3025`. */
    id: text("id").primaryKey(),
    purchaseRequestId: text("purchase_request_id").references(
      () => purchaseRequests.id,
      { onDelete: "cascade" },
    ),
    vendorId: text("vendor_id").references(() => vendors.id),
    status: text("status").notNull().default("Open"),
    total: real("total"),
    issuedOn: text("issued_on"),
    expectedDelivery: text("expected_delivery"),
  },
  (table) => [index("purchase_orders_request_idx").on(table.purchaseRequestId)],
);

export const purchaseOrderItems = sqliteTable(
  "purchase_order_items",
  {
    id: text("id").primaryKey(),
    purchaseOrderId: text("purchase_order_id")
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),
    itemId: text("item_id").references(() => purchaseRequestItems.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    quantity: real("quantity").notNull(),
    unitPrice: real("unit_price"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("purchase_order_items_order_idx").on(table.purchaseOrderId),
  ],
);
