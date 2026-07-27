import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Master data. The DTOs expose these as plain strings (a purchase request has a
 * `department: string`, an item has a `vendor: string | null`), so these tables
 * are joined and flattened back to names by the mappers.
 */

export const departments = sqliteTable("departments", {
  name: text("name").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  /** Scorecard columns, seeded from the vendor-performance report so that
   *  vendor search results can show "4.5 / 5 · 14 POs fulfilled". */
  rating: real("rating"),
  onTimeDeliveryPct: integer("on_time_delivery_pct"),
  posFulfilled: integer("pos_fulfilled"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const catalogItems = sqliteTable("catalog_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  unit: text("unit").notNull(),
  unitCost: real("unit_cost").notNull(),
  category: text("category"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const paymentTerms = sqliteTable("payment_terms", {
  id: text("id").primaryKey(),
  label: text("label").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const rolePermissions = sqliteTable("role_permissions", {
  role: text("role").primaryKey(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
