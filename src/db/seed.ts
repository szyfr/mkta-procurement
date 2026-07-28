import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { canvassingCases, canvassingDetails } from "@/data/canvassing";
import {
  actionableRequests,
  kpis,
  pendingQuotations,
  recentActivity,
  upcomingDeadlines,
} from "@/data/dashboard";
import { notifications as notificationFixtures } from "@/data/notifications";
import {
  catalogItems as catalogItemFixtures,
  departments as departmentFixtures,
  itemCreationRequests as itemCreationRequestFixtures,
  listedPurchaseRequestIds,
  paymentTerms as paymentTermFixtures,
  purchaseRequests as purchaseRequestFixtures,
  vendors as vendorFixtures,
} from "@/data/purchase-requests";
import { reports as reportFixtures } from "@/data/reports";
import {
  currentUser,
  rolePermissions,
  users as userFixtures,
} from "@/data/users";
import { parseFixtureDate } from "@/lib/format/dates";

import * as schema from "./schema";

type Db = BetterSQLite3Database<typeof schema>;

/** Stable id from a display name, e.g. "Acme Industrial Supply" → "acme-industrial-supply". */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const minutesAgo = (now: number, minutes: number) =>
  new Date(now - minutes * 60_000);
const hoursAgo = (now: number, hours: number) =>
  new Date(now - hours * 3_600_000);

/**
 * Places an event `days` calendar days back at a fixed hour, so the relative
 * formatter reliably renders "Yesterday" / "2 days ago" no matter what time of
 * day the database happens to be seeded.
 */
function daysAgoAtNoon(now: Date, days: number): Date {
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - days,
    12,
    0,
    0,
  );
  return date;
}

const optionalDate = (label: string | undefined) =>
  label ? parseFixtureDate(label) : null;

/**
 * Vendor scorecard figures, lifted from the vendor-performance report so that
 * vendor search results can render "4.5 / 5 · 14 POs fulfilled" from real
 * columns instead of a hardcoded string.
 */
const VENDOR_SCORECARD: Record<
  string,
  { rating: number; onTime: number; pos: number }
> = {
  "Metro Lubricants Corp": { rating: 4.5, onTime: 96, pos: 14 },
  "Acme Industrial Supply": { rating: 4.1, onTime: 91, pos: 21 },
  "Del Rosario Trading": { rating: 3.6, onTime: 78, pos: 9 },
};

/** Categories backing the "Items" group in global search. */
const CATALOG_CATEGORY: Record<string, string> = {
  "Hex bolt M8x40 (galvanized)": "Fasteners",
  "Industrial gear oil 20L": "Lubricants & Fluids",
  "Stretch wrap film": "Packaging",
  "Steel drum pallets (48in)": "Packaging",
  "LED light fixtures": "Electrical",
  "Safety gloves, various sizes": "Safety Equipment",
};

/**
 * Purchase orders referenced only by free text in the fixtures ("PO-3025
 * Created", "PO-3011.pdf", the search index, the deadline list).
 */
const PURCHASE_ORDERS = [
  {
    id: "PO-3011",
    purchaseRequestId: "PR-2026-0101",
    vendor: "Acme Industrial Supply",
    issuedOn: "Jun 30",
  },
  {
    id: "PO-3025",
    purchaseRequestId: "PR-2026-0114",
    vendor: "Acme Industrial Supply",
    issuedOn: "Jul 20",
  },
  {
    id: "PO-3021",
    purchaseRequestId: "PR-2026-0115",
    vendor: "Metro Lubricants Corp",
    issuedOn: "Jul 18",
  },
  { id: "PO-3018", purchaseRequestId: null, vendor: null, issuedOn: "Jul 16" },
  { id: "PO-3009", purchaseRequestId: null, vendor: null, issuedOn: "Jul 5" },
] as const;

function isEmpty(db: Db): boolean {
  const row = db
    .select({ count: sql<number>`count(*)` })
    .from(schema.users)
    .get();
  return (row?.count ?? 0) === 0;
}

/**
 * Populates an empty database from the fixtures in `src/data`.
 *
 * The fixtures store display strings ("Jul 20", "10 minutes ago"); this writes
 * real calendar dates and instants, and the mappers render them back on the way
 * out. That is what stops the relative timestamps being frozen forever.
 *
 * `mode: "master"` (used by `npm run db:clear`) seeds only the reference data
 * the app needs to function — departments, vendors, catalog items, payment
 * terms, roles, and users — and leaves every transactional table (purchase
 * requests, canvassing, orders, reports, notifications, dashboard panels)
 * empty. `mode: "full"` (the default, used by `npm run db:reset`) seeds
 * everything, including the demo purchase requests and activity history.
 */
export async function seedIfEmpty(
  db: Db,
  mode: "full" | "master" = "full",
): Promise<void> {
  if (!isEmpty(db)) return;

  const now = new Date();
  const nowMs = now.getTime();

  const vendorId = (name: string) => slugify(name);
  const catalogIdByName = new Map(
    catalogItemFixtures.map((item) => [item.name, slugify(item.name)]),
  );

  db.transaction((tx) => {
    // ---- Master data -----------------------------------------------------
    tx.insert(schema.departments)
      .values(
        departmentFixtures.map((name, index) => ({ name, sortOrder: index })),
      )
      .run();

    tx.insert(schema.vendors)
      .values(
        vendorFixtures.map((name, index) => {
          const score = VENDOR_SCORECARD[name];
          return {
            id: vendorId(name),
            name,
            rating: score?.rating ?? null,
            onTimeDeliveryPct: score?.onTime ?? null,
            posFulfilled: score?.pos ?? null,
            sortOrder: index,
          };
        }),
      )
      .run();

    tx.insert(schema.catalogItems)
      .values(
        catalogItemFixtures.map((item, index) => ({
          id: slugify(item.name),
          name: item.name,
          unit: item.unit,
          unitCost: item.unitCost,
          category: CATALOG_CATEGORY[item.name] ?? null,
          sortOrder: index,
        })),
      )
      .run();

    tx.insert(schema.paymentTerms)
      .values(
        paymentTermFixtures.map((label, index) => ({
          id: slugify(label),
          label,
          sortOrder: index,
        })),
      )
      .run();

    tx.insert(schema.rolePermissions)
      .values(
        rolePermissions.map((entry, index) => ({
          role: entry.role,
          description: entry.description,
          sortOrder: index,
        })),
      )
      .run();

    // ---- Users -----------------------------------------------------------
    // `currentUser` and `users[0]` describe the same person with different
    // fields; they are merged here into one row.
    const emailDomain = currentUser.email.split("@")[1];
    tx.insert(schema.users)
      .values(
        userFixtures.map((user, index) => {
          const isCurrent = user.isCurrentUser === true;
          const handle = user.name.toLowerCase().replace(/[^a-z0-9.]/g, "");
          return {
            id: user.id,
            name: user.name,
            email: isCurrent ? currentUser.email : `${handle}@${emailDomain}`,
            role: user.role,
            department: user.department,
            status: user.status,
            avatar: isCurrent ? currentUser.avatar : "",
            isCurrentUser: isCurrent,
            sortOrder: index,
          };
        }),
      )
      .run();

    const userIdByName = new Map(
      userFixtures.map((user) => [user.name, user.id]),
    );
    const currentUserId =
      userFixtures.find((user) => user.isCurrentUser)?.id ?? userFixtures[0].id;

    if (mode !== "full") return;

    // ---- Purchase requests ----------------------------------------------
    const actionByRequest = new Map(
      actionableRequests.map((request, index) => [
        request.id,
        { ...request, index },
      ]),
    );

    tx.insert(schema.purchaseRequests)
      .values(
        purchaseRequestFixtures.map((request) => {
          const action = actionByRequest.get(request.id);
          const listOrder = listedPurchaseRequestIds.indexOf(request.id);
          return {
            id: request.id,
            title: request.title,
            autoTitle: request.autoTitle === true,
            requester: request.requester,
            // "You" is the signed-in user; "Warehouse Team" and
            // "HR / Facilities" are not people and stay unlinked.
            requesterUserId:
              request.requester === "You"
                ? currentUserId
                : (userIdByName.get(request.requester) ?? null),
            department: request.department,
            amount: request.amount,
            priority: request.priority,
            status: request.status,
            statusLabel: request.statusLabel,
            createdAt: optionalDate(request.createdAt ?? undefined),
            submittedOn: optionalDate(request.submittedOn),
            completedOn: optionalDate(request.completedOn),
            rejectedOn: optionalDate(request.rejectedOn),
            rejectionReason: request.rejectionReason ?? null,
            actionPanelNote: request.actionPanelNote ?? null,
            actionStep: action?.step ?? null,
            actionStepTone: action?.stepTone ?? null,
            actionOrder: action?.index ?? null,
            listOrder: listOrder === -1 ? null : listOrder,
          };
        }),
      )
      .run();

    tx.insert(schema.purchaseRequestItems)
      .values(
        purchaseRequestFixtures.flatMap((request) =>
          request.items.map((item, index) => ({
            id: item.id,
            purchaseRequestId: request.id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            estimatedUnitCost: item.estimatedUnitCost,
            vendorId: item.vendor ? vendorId(item.vendor) : null,
            catalogItemId: catalogIdByName.get(item.name) ?? null,
            sourcing: item.sourcing,
            status: item.status,
            deliveredOn: optionalDate(item.deliveredOn),
            batch: item.batch ?? null,
            notInCatalog: item.notInCatalog === true,
            sortOrder: index,
          })),
        ),
      )
      .run();

    const documents = purchaseRequestFixtures.flatMap((request) =>
      (request.documents ?? []).map((doc, index) => ({
        id: doc.id,
        purchaseRequestId: request.id,
        name: doc.name,
        date: parseFixtureDate(doc.date),
        sortOrder: index,
      })),
    );
    if (documents.length > 0)
      tx.insert(schema.purchaseRequestDocuments).values(documents).run();

    const comments = purchaseRequestFixtures.flatMap((request) =>
      (request.comments ?? []).map((comment, index) => ({
        id: comment.id,
        purchaseRequestId: request.id,
        author: comment.author,
        body: comment.body,
        createdOn: parseFixtureDate(comment.timestamp),
        sortOrder: index,
      })),
    );
    if (comments.length > 0)
      tx.insert(schema.purchaseRequestComments).values(comments).run();

    const activity = purchaseRequestFixtures.flatMap((request) =>
      (request.activity ?? []).map((entry, index) => ({
        id: entry.id,
        purchaseRequestId: request.id,
        description: entry.description,
        occurredOn: parseFixtureDate(entry.timestamp),
        sortOrder: index,
      })),
    );
    if (activity.length > 0)
      tx.insert(schema.purchaseRequestActivity).values(activity).run();

    tx.insert(schema.itemCreationRequests)
      .values(
        itemCreationRequestFixtures.map((request, index) => ({
          id: request.id,
          itemName: request.itemName,
          requestedFor: request.requestedFor,
          requestedBy: request.requestedBy,
          status: request.status,
          statusLabel: request.statusLabel,
          submittedOn: parseFixtureDate(request.submittedOn),
          sortOrder: index,
        })),
      )
      .run();

    // ---- Canvassing ------------------------------------------------------
    // A canvassing "case" in the fixtures is one row per (request, batch, item);
    // the batch is the real entity, so cases are collapsed into batches here and
    // expanded back out by the repository.
    const batchKey = (requestId: string, batch: number) =>
      `${requestId}#${batch}`;
    const batchId = (requestId: string, batch: number) =>
      `${requestId}-b${batch}`;

    const batchesByKey = new Map<string, (typeof canvassingCases)[number]>();
    for (const entry of canvassingCases) {
      const key = batchKey(entry.purchaseRequestId, entry.batch);
      if (!batchesByKey.has(key)) batchesByKey.set(key, entry);
    }

    const detailByRequest = new Map(
      canvassingDetails.map((detail) => [detail.purchaseRequestId, detail]),
    );

    // Fixture quote ids ("q-1"…"q-7") are unique only inside a single detail,
    // so every quote is renamed to `<batchId>-q<n>` and the selection pointer
    // is remapped through this table.
    const quoteIdMap = new Map<string, string>();
    const quoteRows: (typeof schema.vendorQuotes.$inferInsert)[] = [];

    for (const [, entry] of batchesByKey) {
      const id = batchId(entry.purchaseRequestId, entry.batch);
      const detailBatch = detailByRequest
        .get(entry.purchaseRequestId)
        ?.batches.find((candidate) => candidate.batch === entry.batch);

      (detailBatch?.quotes ?? []).forEach((quote, index) => {
        const namespaced = `${id}-q${index + 1}`;
        quoteIdMap.set(`${entry.purchaseRequestId}#${quote.id}`, namespaced);
        quoteRows.push({
          id: namespaced,
          batchId: id,
          vendorId: vendorId(quote.vendor),
          total: quote.total,
          deliveryEstimate: quote.deliveryEstimate,
          quoteDate: parseFixtureDate(quote.quoteDate),
          sortOrder: index,
        });
      });
    }

    const batchRows = [...batchesByKey.values()].map((entry) => {
      const id = batchId(entry.purchaseRequestId, entry.batch);
      const detailBatch = detailByRequest
        .get(entry.purchaseRequestId)
        ?.batches.find((candidate) => candidate.batch === entry.batch);
      const seededQuotes = detailBatch?.quotes.length ?? 0;
      const selected = detailBatch?.selectedVendorId;

      return {
        id,
        purchaseRequestId: entry.purchaseRequestId,
        batch: entry.batch,
        quotesRequired: detailBatch?.quotesRequired ?? entry.quotesRequired,
        // Counts recorded without the underlying quote rows stay as a baseline,
        // so a newly submitted quote still moves the number.
        quotesReceivedBaseline: Math.max(
          0,
          entry.quotesReceived - seededQuotes,
        ),
        exempted: entry.exempted === true,
        status: entry.status,
        statusLabel: entry.statusLabel,
        initiatedOn: parseFixtureDate(entry.initiatedOn),
        selectedQuoteId: selected
          ? (quoteIdMap.get(`${entry.purchaseRequestId}#${selected}`) ?? null)
          : null,
        selectedOn: optionalDate(detailBatch?.selectedOn),
      };
    });

    tx.insert(schema.canvassingBatches).values(batchRows).run();
    if (quoteRows.length > 0)
      tx.insert(schema.vendorQuotes).values(quoteRows).run();

    // Batch membership comes from the items' own batch numbers rather than the
    // single hand-written detail record, so every batch gets its members.
    const batchItemRows = batchRows.flatMap((batch) => {
      const request = purchaseRequestFixtures.find(
        (candidate) => candidate.id === batch.purchaseRequestId,
      );
      return (request?.items ?? [])
        .filter((item) => item.batch === batch.batch)
        .map((item, index) => ({
          batchId: batch.id,
          itemId: item.id,
          sortOrder: index,
        }));
    });
    if (batchItemRows.length > 0)
      tx.insert(schema.canvassingBatchItems).values(batchItemRows).run();

    // ---- Purchase orders -------------------------------------------------
    tx.insert(schema.purchaseOrders)
      .values(
        PURCHASE_ORDERS.map((order) => ({
          id: order.id,
          purchaseRequestId: order.purchaseRequestId,
          vendorId: order.vendor ? vendorId(order.vendor) : null,
          status: "Open",
          issuedOn: parseFixtureDate(order.issuedOn),
        })),
      )
      .run();

    const orderItemRows = PURCHASE_ORDERS.flatMap((order) => {
      if (!order.purchaseRequestId || !order.vendor) return [];
      const request = purchaseRequestFixtures.find(
        (candidate) => candidate.id === order.purchaseRequestId,
      );
      return (request?.items ?? [])
        .filter((item) => item.vendor === order.vendor)
        .map((item, index) => ({
          id: `${order.id}-${index + 1}`,
          purchaseOrderId: order.id,
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.estimatedUnitCost,
          sortOrder: index,
        }));
    });
    if (orderItemRows.length > 0)
      tx.insert(schema.purchaseOrderItems).values(orderItemRows).run();

    // ---- Reports ---------------------------------------------------------
    tx.insert(schema.reports)
      .values(
        reportFixtures.map((report, index) => ({
          id: report.id,
          title: report.title,
          description: report.description,
          resultTitle: report.resultTitle,
          summary: report.summary,
          chartUnit: report.chart.unit ?? null,
          chartCurrency: report.chart.currency === true,
          chartData: report.chart.data,
          tableColumns: report.table.columns,
          tableRows: report.table.rows,
          sortOrder: index,
        })),
      )
      .run();

    // ---- Notifications ---------------------------------------------------
    // The fixture's frozen relative strings become real instants; `timestamp`
    // and `group` are derived from these on read.
    const notificationInstants: Record<string, Date> = {
      "n-1": minutesAgo(nowMs, 10),
      "n-2": minutesAgo(nowMs, 42),
      "n-3": hoursAgo(nowMs, 2),
      "n-4": daysAgoAtNoon(now, 1),
      "n-5": daysAgoAtNoon(now, 2),
    };

    tx.insert(schema.notifications)
      .values(
        notificationFixtures.map((notification) => ({
          id: notification.id,
          userId: currentUserId,
          message: notification.message,
          href: notification.href,
          read: notification.read,
          createdAt:
            notificationInstants[notification.id] ?? hoursAgo(nowMs, 1),
        })),
      )
      .run();

    // ---- Dashboard panels ------------------------------------------------
    tx.insert(schema.dashboardKpis)
      .values(kpis.map((kpi, index) => ({ ...kpi, sortOrder: index })))
      .run();

    const feedInstants: Record<string, Date> = {
      "feed-1": minutesAgo(nowMs, 10),
      "feed-2": minutesAgo(nowMs, 42),
      "feed-3": hoursAgo(nowMs, 2),
    };
    tx.insert(schema.activityFeed)
      .values(
        recentActivity.map((entry) => ({
          id: entry.id,
          description: entry.description,
          createdAt: feedInstants[entry.id] ?? hoursAgo(nowMs, 1),
        })),
      )
      .run();

    tx.insert(schema.pendingQuotations)
      .values(
        pendingQuotations.map((quotation, index) => ({
          id: quotation.id,
          summary: quotation.summary,
          detail: quotation.detail,
          sortOrder: index,
        })),
      )
      .run();

    tx.insert(schema.deadlines)
      .values(
        upcomingDeadlines.map((deadline, index) => ({
          id: deadline.id,
          label: deadline.label,
          due: deadline.due,
          overdue: deadline.overdue === true,
          sortOrder: index,
        })),
      )
      .run();
  });
}
