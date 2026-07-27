import { and, asc, eq, inArray } from "drizzle-orm";

import { db, schema } from "@/db";
import {
  type BatchParts,
  type QuoteRowWithVendor,
  quotesReceived,
  toCanvassingCases,
  toCanvassingDetail,
  toVendorQuote,
} from "@/db/mappers/canvassing";
import { todayIso } from "@/lib/format/dates";
import { ApiError } from "@/lib/http/errors";
import type {
  Actor,
  CanvassingCase,
  CanvassingDetail,
  CreateBatchInput,
  CreateQuoteInput,
  SelectVendorInput,
  VendorQuote,
} from "@/types";

import type { CanvassingFilters, CanvassingRepository } from "../interfaces";
import { appendActivity, nextOrderNumber } from "./purchase-request-repository";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export class SqliteCanvassingRepository implements CanvassingRepository {
  async listCases(filters: CanvassingFilters): Promise<CanvassingCase[]> {
    const requests = db
      .select({
        id: schema.purchaseRequests.id,
        department: schema.purchaseRequests.department,
      })
      .from(schema.purchaseRequests)
      .all();

    const departmentById = new Map(
      requests.map((row) => [row.id, row.department]),
    );
    const grouped = loadBatchParts();

    const cases = [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([requestId, batches]) =>
        toCanvassingCases(
          requestId,
          departmentById.get(requestId) ?? "",
          batches,
        ),
      );

    return cases.filter(
      (entry) =>
        (!filters.department || entry.department === filters.department) &&
        (!filters.status || entry.status === filters.status),
    );
  }

  async getDetail(purchaseRequestId: string): Promise<CanvassingDetail | null> {
    const request = db
      .select()
      .from(schema.purchaseRequests)
      .where(eq(schema.purchaseRequests.id, purchaseRequestId))
      .get();

    if (!request) return null;

    const items = db
      .select()
      .from(schema.purchaseRequestItems)
      .where(
        eq(schema.purchaseRequestItems.purchaseRequestId, purchaseRequestId),
      )
      .orderBy(asc(schema.purchaseRequestItems.sortOrder))
      .all();

    const batches =
      loadBatchParts(purchaseRequestId).get(purchaseRequestId) ?? [];

    return toCanvassingDetail(
      purchaseRequestId,
      request.department,
      items,
      batches,
    );
  }

  async createBatch(
    purchaseRequestId: string,
    input: CreateBatchInput,
    _actor: Actor,
  ): Promise<{ batch: number }> {
    return db.transaction((tx) => {
      requireRequest(tx, purchaseRequestId);

      const items = tx
        .select()
        .from(schema.purchaseRequestItems)
        .where(inArray(schema.purchaseRequestItems.id, input.itemIds))
        .all();

      if (items.length !== input.itemIds.length) {
        throw ApiError.badRequest("One or more items do not exist.");
      }
      const foreign = items.find(
        (item) => item.purchaseRequestId !== purchaseRequestId,
      );
      if (foreign) {
        throw ApiError.badRequest(
          `Item ${foreign.id} does not belong to ${purchaseRequestId}.`,
        );
      }

      // Items already on a purchase order were sourced directly and must not be
      // pulled back into canvassing.
      const alreadySourced = items.find(
        (item) => item.status === "po-created" || item.status === "delivered",
      );
      if (alreadySourced) {
        throw ApiError.conflict(
          `${alreadySourced.name} is already sourced and cannot be canvassed.`,
        );
      }

      const existing = tx
        .select({ batch: schema.canvassingBatches.batch })
        .from(schema.canvassingBatches)
        .where(
          eq(schema.canvassingBatches.purchaseRequestId, purchaseRequestId),
        )
        .all();
      const batch =
        existing.reduce((max, row) => Math.max(max, row.batch), 0) + 1;
      const batchId = `${purchaseRequestId}-b${batch}`;
      const today = todayIso();

      tx.insert(schema.canvassingBatches)
        .values({
          id: batchId,
          purchaseRequestId,
          batch,
          quotesRequired: input.quotesRequired ?? 3,
          quotesReceivedBaseline: 0,
          exempted: false,
          status: "awaiting-quotes",
          statusLabel: "Awaiting Quotes",
          initiatedOn: today,
        })
        .run();

      tx.insert(schema.canvassingBatchItems)
        .values(
          items.map((item, index) => ({
            batchId,
            itemId: item.id,
            sortOrder: index,
          })),
        )
        .run();

      for (const item of items) {
        tx.update(schema.purchaseRequestItems)
          .set({ batch, status: "canvassing" })
          .where(eq(schema.purchaseRequestItems.id, item.id))
          .run();
      }

      appendActivity(
        tx,
        purchaseRequestId,
        `${items.map((item) => item.name).join(", ")} routed to canvassing (Batch ${batch})`,
        today,
      );

      return { batch };
    });
  }

  async addQuote(
    purchaseRequestId: string,
    batch: number,
    input: CreateQuoteInput,
    _actor: Actor,
  ): Promise<VendorQuote> {
    return db.transaction((tx) => {
      const batchRow = requireBatch(tx, purchaseRequestId, batch);

      const vendor = tx
        .select()
        .from(schema.vendors)
        .where(eq(schema.vendors.name, input.vendor))
        .get();
      if (!vendor)
        throw ApiError.badRequest(`Unknown vendor "${input.vendor}".`);

      const existing = tx
        .select()
        .from(schema.vendorQuotes)
        .where(eq(schema.vendorQuotes.batchId, batchRow.id))
        .all();

      const quoteId = `${batchRow.id}-q${existing.length + 1}`;
      const total = input.lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0,
      );

      tx.insert(schema.vendorQuotes)
        .values({
          id: quoteId,
          batchId: batchRow.id,
          vendorId: vendor.id,
          total,
          deliveryEstimate: input.deliveryEstimate,
          quoteDate: input.quoteDate,
          quoteRef: input.quoteRef ?? null,
          paymentTerms: input.paymentTerms ?? null,
          documentName: input.documentName ?? null,
          sortOrder: existing.length,
        })
        .run();

      if (input.lines.length > 0) {
        tx.insert(schema.vendorQuoteLines)
          .values(
            input.lines.map((line, index) => ({
              id: `${quoteId}-l${index + 1}`,
              quoteId,
              itemId: line.itemId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
            })),
          )
          .run();
      }

      // Once the minimum is met the batch is ready to be compared.
      const received = batchRow.quotesReceivedBaseline + existing.length + 1;
      if (!batchRow.selectedQuoteId && received >= batchRow.quotesRequired) {
        tx.update(schema.canvassingBatches)
          .set({ status: "comparison-ready", statusLabel: "Comparison Ready" })
          .where(eq(schema.canvassingBatches.id, batchRow.id))
          .run();
      }

      appendActivity(
        tx,
        purchaseRequestId,
        `Quotation received — ${vendor.name} (Batch ${batch})`,
        input.quoteDate,
      );

      return toVendorQuote({
        id: quoteId,
        batchId: batchRow.id,
        vendorId: vendor.id,
        total,
        deliveryEstimate: input.deliveryEstimate,
        quoteDate: input.quoteDate,
        quoteRef: input.quoteRef ?? null,
        paymentTerms: input.paymentTerms ?? null,
        documentName: input.documentName ?? null,
        sortOrder: existing.length,
        vendorName: vendor.name,
      });
    });
  }

  /**
   * Awarding a batch is the point where canvassing turns into an order: the
   * winning vendor is written onto the batch's items and a purchase order is
   * raised for them, all in one transaction.
   */
  async selectVendor(
    purchaseRequestId: string,
    batch: number,
    input: SelectVendorInput,
    _actor: Actor,
  ): Promise<CanvassingDetail> {
    db.transaction((tx) => {
      const batchRow = requireBatch(tx, purchaseRequestId, batch);

      const quote = tx
        .select()
        .from(schema.vendorQuotes)
        .where(
          and(
            eq(schema.vendorQuotes.id, input.quoteId),
            eq(schema.vendorQuotes.batchId, batchRow.id),
          ),
        )
        .get();

      if (!quote) {
        throw ApiError.badRequest(
          `Quote ${input.quoteId} does not belong to batch ${batch} of ${purchaseRequestId}.`,
        );
      }

      const vendor = tx
        .select()
        .from(schema.vendors)
        .where(eq(schema.vendors.id, quote.vendorId))
        .get();

      const today = todayIso();

      tx.update(schema.canvassingBatches)
        .set({
          selectedQuoteId: quote.id,
          selectedOn: today,
          status: "vendor-selected",
          statusLabel: "Vendor Selected",
        })
        .where(eq(schema.canvassingBatches.id, batchRow.id))
        .run();

      const memberIds = tx
        .select({ itemId: schema.canvassingBatchItems.itemId })
        .from(schema.canvassingBatchItems)
        .where(eq(schema.canvassingBatchItems.batchId, batchRow.id))
        .all()
        .map((row) => row.itemId);

      const items =
        memberIds.length > 0
          ? tx
              .select()
              .from(schema.purchaseRequestItems)
              .where(inArray(schema.purchaseRequestItems.id, memberIds))
              .all()
          : [];

      for (const item of items) {
        tx.update(schema.purchaseRequestItems)
          .set({ status: "po-created", vendorId: quote.vendorId })
          .where(eq(schema.purchaseRequestItems.id, item.id))
          .run();
      }

      const orderId = `PO-${nextOrderNumber(tx)}`;
      tx.insert(schema.purchaseOrders)
        .values({
          id: orderId,
          purchaseRequestId,
          vendorId: quote.vendorId,
          status: "Open",
          total: quote.total,
          issuedOn: today,
        })
        .run();

      if (items.length > 0) {
        tx.insert(schema.purchaseOrderItems)
          .values(
            items.map((item, index) => ({
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
      }

      refreshRequestStatus(tx, purchaseRequestId, orderId);

      appendActivity(
        tx,
        purchaseRequestId,
        `Vendor selected — ${vendor?.name ?? "vendor"} (Batch ${batch})`,
        today,
      );
    });

    const detail = await this.getDetail(purchaseRequestId);
    if (!detail)
      throw ApiError.notFound(`Purchase request ${purchaseRequestId}`);
    return detail;
  }
}

// ---------------------------------------------------------------------------

/**
 * Loads batches with their member items and quotes, grouped by request.
 * Three queries regardless of how many batches are involved.
 */
function loadBatchParts(purchaseRequestId?: string): Map<string, BatchParts[]> {
  const batches = db
    .select()
    .from(schema.canvassingBatches)
    .where(
      purchaseRequestId
        ? eq(schema.canvassingBatches.purchaseRequestId, purchaseRequestId)
        : undefined,
    )
    .orderBy(asc(schema.canvassingBatches.batch))
    .all();

  if (batches.length === 0) return new Map();

  const batchIds = batches.map((batch) => batch.id);

  const members = db
    .select({
      batchId: schema.canvassingBatchItems.batchId,
      sortOrder: schema.canvassingBatchItems.sortOrder,
      item: schema.purchaseRequestItems,
    })
    .from(schema.canvassingBatchItems)
    .innerJoin(
      schema.purchaseRequestItems,
      eq(schema.canvassingBatchItems.itemId, schema.purchaseRequestItems.id),
    )
    .where(inArray(schema.canvassingBatchItems.batchId, batchIds))
    .orderBy(asc(schema.canvassingBatchItems.sortOrder))
    .all();

  const quotes = db
    .select({ quote: schema.vendorQuotes, vendorName: schema.vendors.name })
    .from(schema.vendorQuotes)
    .innerJoin(
      schema.vendors,
      eq(schema.vendorQuotes.vendorId, schema.vendors.id),
    )
    .where(inArray(schema.vendorQuotes.batchId, batchIds))
    .orderBy(asc(schema.vendorQuotes.sortOrder))
    .all()
    .map(
      ({ quote, vendorName }): QuoteRowWithVendor => ({ ...quote, vendorName }),
    );

  const grouped = new Map<string, BatchParts[]>();
  for (const batch of batches) {
    const parts: BatchParts = {
      batch,
      items: members
        .filter((row) => row.batchId === batch.id)
        .map((row) => row.item),
      quotes: quotes.filter((quote) => quote.batchId === batch.id),
    };
    grouped.set(batch.purchaseRequestId, [
      ...(grouped.get(batch.purchaseRequestId) ?? []),
      parts,
    ]);
  }

  return grouped;
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

function requireBatch(tx: Tx, purchaseRequestId: string, batch: number) {
  const row = tx
    .select()
    .from(schema.canvassingBatches)
    .where(
      and(
        eq(schema.canvassingBatches.purchaseRequestId, purchaseRequestId),
        eq(schema.canvassingBatches.batch, batch),
      ),
    )
    .get();
  if (!row) throw ApiError.notFound(`Batch ${batch} of ${purchaseRequestId}`);
  return row;
}

/** Rolls item-level progress up to the request's own status and label. */
function refreshRequestStatus(
  tx: Tx,
  requestId: string,
  orderId: string,
): void {
  const items = tx
    .select()
    .from(schema.purchaseRequestItems)
    .where(eq(schema.purchaseRequestItems.purchaseRequestId, requestId))
    .all();

  const outstanding = items.filter(
    (item) => item.status === "canvassing" || item.status === "awaiting-batch",
  ).length;

  tx.update(schema.purchaseRequests)
    .set(
      outstanding === 0
        ? { status: "po-created", statusLabel: `${orderId} Created` }
        : {
            status: "canvassing",
            statusLabel: `Canvassing · ${items.length - outstanding}/${items.length} items`,
          },
    )
    .where(eq(schema.purchaseRequests.id, requestId))
    .run();
}

export { quotesReceived };
