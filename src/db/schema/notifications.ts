import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./users";

/**
 * `message` and `href` are free text with no foreign key — the fixtures
 * reference PR-2026-0110, which is not a real request.
 *
 * `createdAt` is a real instant; the DTO's `timestamp` ("10 minutes ago") and
 * `group` ("today" | "earlier") are both derived from it by the mapper, which
 * is why neither is stored. Storing them is what made the fixture timestamps
 * permanently frozen.
 */
export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    href: text("href").notNull(),
    read: integer("read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("notifications_created_idx").on(table.createdAt)],
);
