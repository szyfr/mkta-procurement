import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * The dashboard's side panels are curated figures, not live aggregates — the
 * fixtures disagree with the underlying records on purpose (the KPI says 9
 * pending quotations while three are listed; a quotation reads "2 of 3
 * received" for a batch that already has 3). They are stored so the page keeps
 * showing what it is specified to show.
 *
 * "Requests Requiring Action" is the exception: it is a real projection over
 * `purchase_requests.action_step`, not a table.
 */

export const dashboardKpis = sqliteTable("dashboard_kpis", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  value: integer("value").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

/** The global "Recent Activity" feed, distinct from per-request activity. */
export const activityFeed = sqliteTable("activity_feed", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const pendingQuotations = sqliteTable("pending_quotations", {
  id: text("id").primaryKey(),
  summary: text("summary").notNull(),
  detail: text("detail").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const deadlines = sqliteTable("deadlines", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  /** Mixed relative/absolute copy in the fixtures: "Tomorrow", "Jul 24". */
  due: text("due").notNull(),
  overdue: integer("overdue", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});
