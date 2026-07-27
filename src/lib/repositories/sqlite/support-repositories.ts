import { asc, desc, eq, isNotNull, like, or, sql } from "drizzle-orm";

import { db, schema } from "@/db";
import {
  formatRelative,
  formatShortDate,
  notificationGroup,
  todayIso,
} from "@/lib/format/dates";
import { ApiError } from "@/lib/http/errors";
import { purchaseRequestTone, statusLegend } from "@/lib/status-tones";
import type {
  Actor,
  CreateItemCreationRequestInput,
  DashboardData,
  ItemCreationRequest,
  Notification,
  ReportData,
  ReportFilters,
  ReportSummary,
  RolePermission,
  SearchResult,
  SessionUser,
  UpdateAccountInput,
  User,
} from "@/types";

import type {
  DashboardRepository,
  ItemCreationRequestRepository,
  NotificationRepository,
  ReferenceRepository,
  ReportRepository,
  SearchRepository,
  UserRepository,
} from "../interfaces";

const DEFAULT_DATE_RANGE = "Last 90 days";

export class SqliteDashboardRepository implements DashboardRepository {
  async get(_actor: Actor): Promise<DashboardData> {
    const now = new Date();

    const kpis = db
      .select()
      .from(schema.dashboardKpis)
      .orderBy(asc(schema.dashboardKpis.sortOrder))
      .all()
      .map((row) => ({ id: row.id, value: row.value, label: row.label }));

    // The only genuinely derived panel: a projection over the requests that
    // carry an action step.
    const actionableRequests = db
      .select()
      .from(schema.purchaseRequests)
      .where(isNotNull(schema.purchaseRequests.actionStep))
      .orderBy(asc(schema.purchaseRequests.actionOrder))
      .all()
      .map((row) => ({
        id: row.id,
        requester: row.requester,
        department: row.department,
        amount: row.amount,
        step: row.actionStep ?? "",
        stepTone: row.actionStepTone ?? "neutral",
        priority: row.priority,
      }));

    const recentActivity = db
      .select()
      .from(schema.activityFeed)
      .orderBy(desc(schema.activityFeed.createdAt))
      .all()
      .map((row) => ({
        id: row.id,
        description: row.description,
        timestamp: formatRelative(row.createdAt, now),
      }));

    const pendingQuotations = db
      .select()
      .from(schema.pendingQuotations)
      .orderBy(asc(schema.pendingQuotations.sortOrder))
      .all()
      .map((row) => ({ id: row.id, summary: row.summary, detail: row.detail }));

    const upcomingDeadlines = db
      .select()
      .from(schema.deadlines)
      .orderBy(asc(schema.deadlines.sortOrder))
      .all()
      .map((row) => ({
        id: row.id,
        label: row.label,
        due: row.due,
        ...(row.overdue ? { overdue: true } : {}),
      }));

    return {
      kpis,
      actionableRequests,
      recentActivity,
      pendingQuotations,
      upcomingDeadlines,
    };
  }
}

export class SqliteItemCreationRequestRepository
  implements ItemCreationRequestRepository
{
  async list(): Promise<ItemCreationRequest[]> {
    return db
      .select()
      .from(schema.itemCreationRequests)
      .orderBy(asc(schema.itemCreationRequests.sortOrder))
      .all()
      .map((row) => ({
        id: row.id,
        itemName: row.itemName,
        requestedFor: row.requestedFor,
        requestedBy: row.requestedBy,
        status: row.status,
        statusLabel: row.statusLabel,
        submittedOn: formatShortDate(row.submittedOn),
      }));
  }

  async create(
    input: CreateItemCreationRequestInput,
    actor: Actor,
  ): Promise<ItemCreationRequest> {
    const rows = db
      .select({ id: schema.itemCreationRequests.id })
      .from(schema.itemCreationRequests)
      .all();
    const highest = rows.reduce((max, row) => {
      const suffix = Number(row.id.split("-").pop());
      return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
    }, 0);

    const id = `ICR-${String(highest + 1).padStart(4, "0")}`;
    const submittedOn = todayIso();

    db.insert(schema.itemCreationRequests)
      .values({
        id,
        itemName: input.itemName,
        requestedFor: input.requestedFor ?? null,
        requestedBy: actor.name,
        status: "pending",
        statusLabel: "Pending Review",
        submittedOn,
        sortOrder: -1,
      })
      .run();

    return {
      id,
      itemName: input.itemName,
      requestedFor: input.requestedFor ?? null,
      requestedBy: actor.name,
      status: "pending",
      statusLabel: "Pending Review",
      submittedOn: formatShortDate(submittedOn),
    };
  }
}

export class SqliteReportRepository implements ReportRepository {
  async list(): Promise<ReportSummary[]> {
    return db
      .select({
        id: schema.reports.id,
        title: schema.reports.title,
        description: schema.reports.description,
      })
      .from(schema.reports)
      .orderBy(asc(schema.reports.sortOrder))
      .all();
  }

  async get(id: string, filters: ReportFilters): Promise<ReportData | null> {
    const row = db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.id, id))
      .get();
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      // The stored rows are canned and pre-formatted, so a narrower range
      // cannot recompute them; the chosen range is reflected in the heading.
      resultTitle: filters.dateRange
        ? `${row.title} — ${filters.dateRange}`
        : row.resultTitle,
      summary: row.summary,
      chart: {
        data: row.chartData,
        ...(row.chartUnit ? { unit: row.chartUnit } : {}),
        ...(row.chartCurrency ? { currency: true } : {}),
      },
      table: { columns: row.tableColumns, rows: row.tableRows },
    };
  }
}

export class SqliteNotificationRepository implements NotificationRepository {
  async list(actor: Actor): Promise<Notification[]> {
    const now = new Date();
    return db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, actor.id))
      .orderBy(desc(schema.notifications.createdAt))
      .all()
      .map((row) => toNotification(row, now));
  }

  async markRead(id: string, actor: Actor): Promise<Notification> {
    const row = db
      .select()
      .from(schema.notifications)
      .where(eq(schema.notifications.id, id))
      .get();

    if (!row || row.userId !== actor.id) {
      throw ApiError.notFound(`Notification ${id}`);
    }

    db.update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.id, id))
      .run();

    return toNotification({ ...row, read: true }, new Date());
  }

  async markAllRead(actor: Actor): Promise<Notification[]> {
    db.update(schema.notifications)
      .set({ read: true })
      .where(eq(schema.notifications.userId, actor.id))
      .run();

    return this.list(actor);
  }
}

function toNotification(
  row: typeof schema.notifications.$inferSelect,
  now: Date,
): Notification {
  return {
    id: row.id,
    message: row.message,
    // Both derived from the stored instant, which is why they stay correct as
    // time passes instead of being frozen at seed time.
    timestamp: formatRelative(row.createdAt, now),
    group: notificationGroup(row.createdAt, now),
    read: row.read,
    href: row.href,
  };
}

/** Short status labels for search badges, reusing the list-page legend. */
const SHORT_STATUS_LABEL = new Map(
  statusLegend.map((entry) => [entry.status, entry.label]),
);

export class SqliteSearchRepository implements SearchRepository {
  async search(query: string): Promise<SearchResult[]> {
    const term = query.trim();
    if (!term) return [];

    const pattern = `%${term}%`;
    const results: SearchResult[] = [];

    const requests = db
      .select()
      .from(schema.purchaseRequests)
      .where(
        or(
          like(schema.purchaseRequests.id, pattern),
          like(schema.purchaseRequests.title, pattern),
        ),
      )
      .orderBy(desc(schema.purchaseRequests.id))
      .all();

    for (const request of requests) {
      results.push({
        id: request.id,
        type: "Purchase Requests",
        label: request.id,
        detail: request.title ?? "Untitled draft",
        badge: SHORT_STATUS_LABEL.get(request.status) ?? request.statusLabel,
        badgeTone: purchaseRequestTone[request.status],
        href: `/purchase-requests/${request.id}`,
      });
    }

    const orders = db
      .select({ order: schema.purchaseOrders, vendorName: schema.vendors.name })
      .from(schema.purchaseOrders)
      .leftJoin(
        schema.vendors,
        eq(schema.purchaseOrders.vendorId, schema.vendors.id),
      )
      .where(
        or(
          like(schema.purchaseOrders.id, pattern),
          like(schema.vendors.name, pattern),
        ),
      )
      .orderBy(desc(schema.purchaseOrders.id))
      .all();

    for (const { order, vendorName } of orders) {
      results.push({
        id: order.id,
        type: "Purchase Orders",
        label: order.id,
        detail: vendorName ?? "—",
        badge: order.status,
        badgeTone: "neutral",
        href: order.purchaseRequestId
          ? `/purchase-requests/${order.purchaseRequestId}`
          : "/purchase-requests",
      });
    }

    const items = db
      .select()
      .from(schema.catalogItems)
      .where(
        or(
          like(schema.catalogItems.name, pattern),
          like(schema.catalogItems.category, pattern),
        ),
      )
      .orderBy(asc(schema.catalogItems.sortOrder))
      .all();

    for (const item of items) {
      results.push({
        id: item.id,
        type: "Items",
        label: item.name,
        detail: item.category ?? "Catalog item",
        href: "/purchase-requests",
      });
    }

    const vendors = db
      .select()
      .from(schema.vendors)
      .where(like(schema.vendors.name, pattern))
      .orderBy(asc(schema.vendors.sortOrder))
      .all();

    for (const vendor of vendors) {
      results.push({
        id: vendor.id,
        type: "Vendors",
        label: vendor.name,
        detail:
          vendor.rating === null
            ? "No ratings yet"
            : `${vendor.rating} / 5 · ${vendor.posFulfilled ?? 0} POs fulfilled`,
        href: "/reports",
      });
    }

    return results;
  }
}

export class SqliteUserRepository implements UserRepository {
  async list(): Promise<User[]> {
    return db
      .select()
      .from(schema.users)
      .orderBy(asc(schema.users.sortOrder))
      .all()
      .map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        department: row.department,
        status: row.status,
        ...(row.isCurrentUser ? { isCurrentUser: true } : {}),
      }));
  }

  async listRolePermissions(): Promise<RolePermission[]> {
    return db
      .select({
        role: schema.rolePermissions.role,
        description: schema.rolePermissions.description,
      })
      .from(schema.rolePermissions)
      .orderBy(asc(schema.rolePermissions.sortOrder))
      .all();
  }

  async getAccount(actor: Actor): Promise<SessionUser> {
    const row = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, actor.id))
      .get();
    if (!row) throw ApiError.notFound("The signed-in user");
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department,
      avatar: row.avatar,
    };
  }

  async updateAccount(
    input: UpdateAccountInput,
    actor: Actor,
  ): Promise<SessionUser> {
    db.update(schema.users)
      .set({
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.email === undefined ? {} : { email: input.email }),
        ...(input.department === undefined
          ? {}
          : { department: input.department }),
      })
      .where(eq(schema.users.id, actor.id))
      .run();

    return this.getAccount(actor);
  }
}

export class SqliteReferenceRepository implements ReferenceRepository {
  async listDepartments(): Promise<string[]> {
    return db
      .select({ name: schema.departments.name })
      .from(schema.departments)
      .orderBy(asc(schema.departments.sortOrder))
      .all()
      .map((row) => row.name);
  }

  async listVendors(): Promise<string[]> {
    return db
      .select({ name: schema.vendors.name })
      .from(schema.vendors)
      .orderBy(asc(schema.vendors.sortOrder))
      .all()
      .map((row) => row.name);
  }

  async listPaymentTerms(): Promise<string[]> {
    return db
      .select({ label: schema.paymentTerms.label })
      .from(schema.paymentTerms)
      .orderBy(asc(schema.paymentTerms.sortOrder))
      .all()
      .map((row) => row.label);
  }

  async listCatalogItems() {
    return db
      .select({
        name: schema.catalogItems.name,
        unit: schema.catalogItems.unit,
        unitCost: schema.catalogItems.unitCost,
      })
      .from(schema.catalogItems)
      .orderBy(asc(schema.catalogItems.sortOrder))
      .all();
  }
}

export { DEFAULT_DATE_RANGE, sql };
