import type { Repositories, RequestContext } from "../interfaces";
import { SqliteCanvassingRepository } from "./canvassing-repository";
import { SqlitePurchaseRequestRepository } from "./purchase-request-repository";
import {
  SqliteDashboardRepository,
  SqliteItemCreationRequestRepository,
  SqliteNotificationRepository,
  SqliteReferenceRepository,
  SqliteReportRepository,
  SqliteSearchRepository,
  SqliteUserRepository,
} from "./support-repositories";

/**
 * The local implementation. `RequestContext` carries credentials for a remote
 * backend and is unused here — the database connection is process-wide, and the
 * caller's identity arrives as the `Actor` passed to each write.
 */
export function createSqliteRepositories(_ctx: RequestContext): Repositories {
  return {
    purchaseRequests: new SqlitePurchaseRequestRepository(),
    itemCreationRequests: new SqliteItemCreationRequestRepository(),
    canvassing: new SqliteCanvassingRepository(),
    dashboard: new SqliteDashboardRepository(),
    reports: new SqliteReportRepository(),
    notifications: new SqliteNotificationRepository(),
    search: new SqliteSearchRepository(),
    users: new SqliteUserRepository(),
    reference: new SqliteReferenceRepository(),
  };
}
