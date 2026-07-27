import { sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

import { db, ensureDatabaseReady, schema } from "@/db";
import { ok, withRoute } from "@/lib/http";

/**
 * Readiness probe. Touching it also runs migrations and the initial seed, which
 * makes it the quickest way to confirm the database came up correctly.
 */

const TABLES: Record<string, SQLiteTable> = {
  users: schema.users,
  departments: schema.departments,
  vendors: schema.vendors,
  catalogItems: schema.catalogItems,
  purchaseRequests: schema.purchaseRequests,
  purchaseRequestItems: schema.purchaseRequestItems,
  purchaseRequestDocuments: schema.purchaseRequestDocuments,
  purchaseRequestComments: schema.purchaseRequestComments,
  purchaseRequestActivity: schema.purchaseRequestActivity,
  itemCreationRequests: schema.itemCreationRequests,
  canvassingBatches: schema.canvassingBatches,
  canvassingBatchItems: schema.canvassingBatchItems,
  vendorQuotes: schema.vendorQuotes,
  purchaseOrders: schema.purchaseOrders,
  purchaseOrderItems: schema.purchaseOrderItems,
  reports: schema.reports,
  notifications: schema.notifications,
  dashboardKpis: schema.dashboardKpis,
  activityFeed: schema.activityFeed,
};

export const GET = withRoute(async () => {
  await ensureDatabaseReady();

  const counts: Record<string, number> = {};
  for (const [name, table] of Object.entries(TABLES)) {
    const row = db.select({ count: sql<number>`count(*)` }).from(table).get();
    counts[name] = row?.count ?? 0;
  }

  return ok({
    status: "ok",
    backend: process.env.PROCUREMENT_BACKEND ?? "sqlite",
    counts,
  });
});
