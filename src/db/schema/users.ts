import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { UserStatus } from "@/lib/types";

/**
 * `currentUser` and `users[0]` in the fixtures describe the same person with
 * different fields; they are reconciled into a single row here. The session
 * layer resolves the signed-in user via `isCurrentUser`.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  status: text("status").$type<UserStatus>().notNull(),
  avatar: text("avatar").notNull().default(""),
  isCurrentUser: integer("is_current_user", { mode: "boolean" })
    .notNull()
    .default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});
