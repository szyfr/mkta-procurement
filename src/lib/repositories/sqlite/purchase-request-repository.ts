import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  like,
  or,
  sql,
} from "drizzle-orm";

import { db, schema } from "@/db";
import {
  type ItemRowWithVendor,
  type PurchaseRequestParts,
  toPurchaseRequest,
} from "@/db/mappers/purchase-request";
import { FIXTURE_YEAR, formatShortDate, todayIso } from "@/lib/format/dates";
import { ApiError } from "@/lib/http/errors";
import type {
  Actor,
  CreatePurchaseRequestInput,
  Paginated,
  ProofOfOrderInput,
  PurchaseRequest,
  PurchaseRequestFilters,
  PurchaseRequestItemInput,
  UpdatePurchaseRequestInput,
} from "@/types";

import type { PurchaseRequestRepository } from "../interfaces";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const DEFAULT_PAGE_SIZE = 25;

export class SqlitePurchaseRequestRepository
  implements PurchaseRequestRepository
{
  async list(
    filters: PurchaseRequestFilters,
  ): Promise<Paginated<PurchaseRequest>> {
    const listedOnly = filters.listedOnly ?? true;
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE);

    const conditions = [
      listedOnly ? isNotNull(schema.purchaseRequests.listOrder) : undefined,
      filters.status
        ? eq(schema.purchaseRequests.status, filters.status)
        : undefined,
      filters.priority
        ? eq(schema.purchaseRequests.priority, filters.priority)
        : undefined,
      filters.department
        ? eq(schema.purchaseRequests.department, filters.department)
        : undefined,
      filters.q
        ? or(
            like(schema.purchaseRequests.id, `%${filters.q}%`),
            like(schema.purchaseRequests.title, `%${filters.q}%`),
          )
        : undefined,
    ].filter((condition) => condition !== undefined);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalRow = db
      .select({ count: sql<number>`count(*)` })
      .from(schema.purchaseRequests)
      .where(where)
      .get();

    const rows = db
      .select()
      .from(schema.purchaseRequests)
      .where(where)
      // `listOrder` is the curated wireframe ordering, not a computable sort.
      .orderBy(
        listedOnly
          ? asc(schema.purchaseRequests.listOrder)
          : desc(schema.purchaseRequests.id),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all();

    return {
      items: loadAggregates(rows).map(toPurchaseRequest),
      total: totalRow?.count ?? 0,
      page,
      pageSize,
    };
  }

  async getById(id: string): Promise<PurchaseRequest | null> {
    const request = db
      .select()
      .from(schema.purchaseRequests)
      .where(eq(schema.purchaseRequests.id, id))
      .get();

    if (!request) return null;
    return toPurchaseRequest(loadAggregates([request])[0]);
  }

  async create(
    input: CreatePurchaseRequestInput,
    actor: Actor,
  ): Promise<PurchaseRequest> {
    const id = db.transaction((tx) => {
      const requestId = nextRequestId(tx);

      tx.insert(schema.purchaseRequests)
        .values({
          id: requestId,
          title: input.title ?? null,
          autoTitle: !input.title,
          requester: actor.name,
          requesterUserId: actor.id,
          department: input.department,
          amount: sumItems(input.items),
          priority: input.priority,
          status: "draft",
          statusLabel: "Draft",
          // Drafts have no created date until they are submitted, matching the
          // list view, which leaves the column blank for them.
          createdAt: null,
          listOrder: nextListOrder(tx),
        })
        .run();

      insertItems(tx, requestId, input.items);
      return requestId;
    });

    const created = await this.getById(id);
    if (!created) throw ApiError.notFound("The purchase request");
    return created;
  }

  async update(
    id: string,
    input: UpdatePurchaseRequestInput,
    _actor: Actor,
  ): Promise<PurchaseRequest> {
    db.transaction((tx) => {
      const existing = requireRequest(tx, id);

      tx.update(schema.purchaseRequests)
        .set({
          ...(input.title === undefined
            ? {}
            : { title: input.title, autoTitle: !input.title }),
          ...(input.department === undefined
            ? {}
            : { department: input.department }),
          ...(input.priority === undefined ? {} : { priority: input.priority }),
          ...(input.items === undefined
            ? {}
            : { amount: sumItems(input.items) }),
        })
        .where(eq(schema.purchaseRequests.id, existing.id))
        .run();

      if (input.items !== undefined) {
        tx.delete(schema.purchaseRequestItems)
          .where(eq(schema.purchaseRequestItems.purchaseRequestId, id))
          .run();
        insertItems(tx, id, input.items);
      }
    });

    const updated = await this.getById(id);
    if (!updated) throw ApiError.notFound("The purchase request");
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = db
      .delete(schema.purchaseRequests)
      .where(eq(schema.purchaseRequests.id, id))
      .run();

    if (result.changes === 0) throw ApiError.notFound("The purchase request");
  }

  /**
   * Submitting decides how each item is sourced.
   *
   * Items with a named vendor go straight onto a purchase order, one per
   * vendor. Items that need canvassing are parked as `awaiting-batch` for the
   * batch builder to pick up. The request's own status follows from whether any
   * item still needs canvassing.
   */
  async submit(id: string, actor: Actor): Promise<PurchaseRequest> {
    db.transaction((tx) => {
      const request = requireRequest(tx, id);
      if (request.status !== "draft") {
        throw ApiError.conflict(`${id} has already been submitted.`);
      }

      const items = tx
        .select()
        .from(schema.purchaseRequestItems)
        .where(eq(schema.purchaseRequestItems.purchaseRequestId, id))
        .all();

      if (items.length === 0) {
        throw ApiError.badRequest(
          "A request needs at least one item before it can be submitted.",
        );
      }

      const today = todayIso();
      const directItems = items.filter(
        (item) => item.sourcing === "direct" && item.vendorId !== null,
      );
      const canvassingItems = items.filter(
        (item) => !directItems.includes(item),
      );

      const orderIds = createPurchaseOrders(tx, request.id, directItems, today);

      for (const item of directItems) {
        tx.update(schema.purchaseRequestItems)
          .set({ status: "po-created" })
          .where(eq(schema.purchaseRequestItems.id, item.id))
          .run();
      }
      for (const item of canvassingItems) {
        tx.update(schema.purchaseRequestItems)
          .set({ status: "awaiting-batch" })
          .where(eq(schema.purchaseRequestItems.id, item.id))
          .run();
      }

      const needsCanvassing = canvassingItems.length > 0;
      const statusLabel = needsCanvassing
        ? `Canvassing · 0/${items.length} items`
        : `${orderIds[0] ?? "PO"} Created`;

      tx.update(schema.purchaseRequests)
        .set({
          status: needsCanvassing ? "canvassing" : "po-created",
          statusLabel,
          submittedOn: today,
          createdAt: request.createdAt ?? today,
        })
        .where(eq(schema.purchaseRequests.id, id))
        .run();

      appendActivity(tx, id, `Submitted by ${actor.name}`, today);
    });

    const submitted = await this.getById(id);
    if (!submitted) throw ApiError.notFound("The purchase request");
    return submitted;
  }

  /**
   * Records delivery for one item and rolls the result up to the request:
   * every item delivered completes it, some delivered leaves it partial.
   */
  async recordProofOfOrder(
    id: string,
    itemId: string,
    input: ProofOfOrderInput,
    _actor: Actor,
  ): Promise<PurchaseRequest> {
    db.transaction((tx) => {
      requireRequest(tx, id);

      const item = tx
        .select()
        .from(schema.purchaseRequestItems)
        .where(
          and(
            eq(schema.purchaseRequestItems.id, itemId),
            eq(schema.purchaseRequestItems.purchaseRequestId, id),
          ),
        )
        .get();

      if (!item) throw ApiError.notFound(`Item ${itemId} on ${id}`);

      tx.update(schema.purchaseRequestItems)
        .set({ status: "delivered", deliveredOn: input.deliveredOn })
        .where(eq(schema.purchaseRequestItems.id, itemId))
        .run();

      tx.insert(schema.purchaseRequestDocuments)
        .values({
          id: `doc-${itemId}-${Date.now()}`,
          purchaseRequestId: id,
          name: input.documentName,
          date: input.deliveredOn,
          sortOrder: nextSortOrder(
            tx
              .select({ sortOrder: schema.purchaseRequestDocuments.sortOrder })
              .from(schema.purchaseRequestDocuments)
              .where(eq(schema.purchaseRequestDocuments.purchaseRequestId, id))
              .all(),
          ),
        })
        .run();

      const items = tx
        .select()
        .from(schema.purchaseRequestItems)
        .where(eq(schema.purchaseRequestItems.purchaseRequestId, id))
        .all();

      const delivered = items.filter(
        (row) => row.status === "delivered",
      ).length;
      const complete = delivered === items.length;

      tx.update(schema.purchaseRequests)
        .set({
          status: complete ? "completed" : "partially-completed",
          statusLabel: complete
            ? "Completed"
            : `Partially Completed — ${delivered}/${items.length} items`,
          ...(complete ? { completedOn: input.deliveredOn } : {}),
        })
        .where(eq(schema.purchaseRequests.id, id))
        .run();

      appendActivity(
        tx,
        id,
        `${item.name} marked delivered`,
        input.deliveredOn,
      );
    });

    const updated = await this.getById(id);
    if (!updated) throw ApiError.notFound("The purchase request");
    return updated;
  }
}

// ---------------------------------------------------------------------------
// Shared query helpers
// ---------------------------------------------------------------------------

/**
 * Loads the children for a set of requests in four queries rather than four per
 * request, then groups them in memory.
 */
function loadAggregates(
  requests: (typeof schema.purchaseRequests.$inferSelect)[],
): PurchaseRequestParts[] {
  if (requests.length === 0) return [];

  const ids = requests.map((request) => request.id);

  const items = db
    .select({
      item: schema.purchaseRequestItems,
      vendorName: schema.vendors.name,
    })
    .from(schema.purchaseRequestItems)
    .leftJoin(
      schema.vendors,
      eq(schema.purchaseRequestItems.vendorId, schema.vendors.id),
    )
    .where(inArray(schema.purchaseRequestItems.purchaseRequestId, ids))
    .orderBy(asc(schema.purchaseRequestItems.sortOrder))
    .all()
    .map(
      ({ item, vendorName }): ItemRowWithVendor => ({ ...item, vendorName }),
    );

  const documents = db
    .select()
    .from(schema.purchaseRequestDocuments)
    .where(inArray(schema.purchaseRequestDocuments.purchaseRequestId, ids))
    .orderBy(asc(schema.purchaseRequestDocuments.sortOrder))
    .all();

  const comments = db
    .select()
    .from(schema.purchaseRequestComments)
    .where(inArray(schema.purchaseRequestComments.purchaseRequestId, ids))
    .orderBy(asc(schema.purchaseRequestComments.sortOrder))
    .all();

  const activity = db
    .select()
    .from(schema.purchaseRequestActivity)
    .where(inArray(schema.purchaseRequestActivity.purchaseRequestId, ids))
    .orderBy(asc(schema.purchaseRequestActivity.sortOrder))
    .all();

  const by = <T extends { purchaseRequestId: string }>(rows: T[], id: string) =>
    rows.filter((row) => row.purchaseRequestId === id);

  return requests.map((request) => ({
    request,
    items: by(items, request.id),
    documents: by(documents, request.id),
    comments: by(comments, request.id),
    activity: by(activity, request.id),
  }));
}

function requireRequest(tx: Tx, id: string) {
  const request = tx
    .select()
    .from(schema.purchaseRequests)
    .where(eq(schema.purchaseRequests.id, id))
    .get();
  if (!request) throw ApiError.notFound(`Purchase request ${id}`);
  return request;
}

function sumItems(items: PurchaseRequestItemInput[]): number {
  return items.reduce(
    (total, item) => total + item.quantity * (item.estimatedUnitCost ?? 0),
    0,
  );
}

function nextSortOrder(rows: { sortOrder: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.sortOrder + 1), 0);
}

/** `PR-2026-0114` → the next free `PR-2026-####`. */
function nextRequestId(tx: Tx): string {
  const rows = tx
    .select({ id: schema.purchaseRequests.id })
    .from(schema.purchaseRequests)
    .all();
  const highest = rows.reduce((max, row) => {
    const suffix = Number(row.id.split("-").pop());
    return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
  }, 0);
  return `PR-${FIXTURE_YEAR}-${String(highest + 1).padStart(4, "0")}`;
}

function nextListOrder(tx: Tx): number {
  const rows = tx
    .select({ listOrder: schema.purchaseRequests.listOrder })
    .from(schema.purchaseRequests)
    .all();
  return rows.reduce((max, row) => Math.max(max, (row.listOrder ?? -1) + 1), 0);
}

function insertItems(
  tx: Tx,
  requestId: string,
  items: PurchaseRequestItemInput[],
): void {
  if (items.length === 0) return;

  const vendors = tx.select().from(schema.vendors).all();
  const catalog = tx.select().from(schema.catalogItems).all();

  tx.insert(schema.purchaseRequestItems)
    .values(
      items.map((item, index) => ({
        id: `${requestId}-${index + 1}`,
        purchaseRequestId: requestId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit ?? null,
        estimatedUnitCost: item.estimatedUnitCost ?? null,
        vendorId: item.vendor
          ? (vendors.find((vendor) => vendor.name === item.vendor)?.id ?? null)
          : null,
        catalogItemId:
          catalog.find((entry) => entry.name === item.name)?.id ?? null,
        sourcing: item.sourcing,
        status: "pending" as const,
        notInCatalog: item.notInCatalog === true,
        sortOrder: index,
      })),
    )
    .run();
}

/** One purchase order per vendor, covering that vendor's directly-sourced items. */
function createPurchaseOrders(
  tx: Tx,
  requestId: string,
  items: (typeof schema.purchaseRequestItems.$inferSelect)[],
  issuedOn: string,
): string[] {
  if (items.length === 0) return [];

  const byVendor = new Map<string, typeof items>();
  for (const item of items) {
    if (!item.vendorId) continue;
    byVendor.set(item.vendorId, [...(byVendor.get(item.vendorId) ?? []), item]);
  }

  const created: string[] = [];
  let sequence = nextOrderNumber(tx);

  for (const [vendorId, vendorItems] of byVendor) {
    const orderId = `PO-${sequence}`;
    sequence += 1;

    tx.insert(schema.purchaseOrders)
      .values({
        id: orderId,
        purchaseRequestId: requestId,
        vendorId,
        status: "Open",
        total: vendorItems.reduce(
          (sum, item) => sum + item.quantity * (item.estimatedUnitCost ?? 0),
          0,
        ),
        issuedOn,
      })
      .run();

    tx.insert(schema.purchaseOrderItems)
      .values(
        vendorItems.map((item, index) => ({
          id: `${orderId}-${index + 1}`,
          purchaseOrderId: orderId,
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.estimatedUnitCost,
          sortOrder: index,
        })),
      )
      .run();

    created.push(orderId);
  }

  return created;
}

export function nextOrderNumber(tx: Tx): number {
  const rows = tx
    .select({ id: schema.purchaseOrders.id })
    .from(schema.purchaseOrders)
    .all();
  return (
    rows.reduce((max, row) => {
      const suffix = Number(row.id.split("-").pop());
      return Number.isFinite(suffix) ? Math.max(max, suffix) : max;
    }, 3000) + 1
  );
}

export function appendActivity(
  tx: Tx,
  requestId: string,
  description: string,
  occurredOn: string,
): void {
  const existing = tx
    .select({ sortOrder: schema.purchaseRequestActivity.sortOrder })
    .from(schema.purchaseRequestActivity)
    .where(eq(schema.purchaseRequestActivity.purchaseRequestId, requestId))
    .all();

  // Newest first, matching how the timeline is rendered.
  tx.update(schema.purchaseRequestActivity)
    .set({ sortOrder: sql`${schema.purchaseRequestActivity.sortOrder} + 1` })
    .where(eq(schema.purchaseRequestActivity.purchaseRequestId, requestId))
    .run();

  tx.insert(schema.purchaseRequestActivity)
    .values({
      id: `act-${requestId}-${existing.length + 1}-${Date.now()}`,
      purchaseRequestId: requestId,
      description,
      occurredOn,
      sortOrder: 0,
    })
    .run();
}

/** Re-exported for the canvassing repository, which also writes activity. */
export { formatShortDate };
