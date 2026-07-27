import { formatShortDate } from "@/lib/format/dates";
import { canvassingTone } from "@/lib/status-tones";
import type {
  CanvassingBatch,
  CanvassingCase,
  CanvassingDetail,
  StatusTone,
  VendorQuote,
} from "@/types";

import type * as schema from "../schema";

type BatchRow = typeof schema.canvassingBatches.$inferSelect;
type ItemRow = typeof schema.purchaseRequestItems.$inferSelect;
type QuoteRow = typeof schema.vendorQuotes.$inferSelect;

export type QuoteRowWithVendor = QuoteRow & { vendorName: string };

export interface BatchParts {
  batch: BatchRow;
  items: ItemRow[];
  quotes: QuoteRowWithVendor[];
}

const AWAITING_BATCH_LABEL = "Awaiting Batch Assignment";

/** How an item with no batch is described, based on how it was sourced. */
const UNBATCHED_LABEL: Partial<
  Record<ItemRow["status"], { label: string; tone: StatusTone }>
> = {
  "po-created": { label: "PO Created — sourced directly", tone: "ordered" },
  delivered: { label: "Delivered", tone: "success" },
};

/**
 * Quotes counted against a batch: the seeded baseline plus the rows that exist.
 *
 * The fixtures record counts for batches whose individual quotes were never
 * written down ("2 of 3 received" with no quote rows), so a plain `COUNT` would
 * under-report. Adding to a baseline means a newly submitted quote moves the
 * number without any separate bookkeeping.
 */
export function quotesReceived(parts: BatchParts): number {
  return parts.batch.quotesReceivedBaseline + parts.quotes.length;
}

export function toVendorQuote(row: QuoteRowWithVendor): VendorQuote {
  return {
    id: row.id,
    vendor: row.vendorName,
    total: row.total,
    deliveryEstimate: row.deliveryEstimate,
    quoteDate: formatShortDate(row.quoteDate),
  };
}

export function toCanvassingBatch(parts: BatchParts): CanvassingBatch {
  const { batch } = parts;
  return {
    batch: batch.batch,
    quotesRequired: batch.quotesRequired,
    quotesReceived: quotesReceived(parts),
    items: parts.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
    })),
    quotes: parts.quotes.map(toVendorQuote),
    // The DTO field is named `selectedVendorId` but carries a quote id; the
    // column is named for what it holds and is renamed here at the boundary.
    ...(batch.selectedQuoteId
      ? { selectedVendorId: batch.selectedQuoteId }
      : {}),
    ...(batch.selectedOn
      ? { selectedOn: formatShortDate(batch.selectedOn) }
      : {}),
  };
}

/**
 * Expands batches back into the list view's rows: one per item per batch, which
 * is why a request with items awarded to different vendors appears more than
 * once.
 */
export function toCanvassingCases(
  purchaseRequestId: string,
  department: string,
  batches: BatchParts[],
): CanvassingCase[] {
  const ordered = [...batches].sort((a, b) => a.batch.batch - b.batch.batch);
  const shortId = purchaseRequestId.slice(-4);
  let sequence = 0;

  return ordered.flatMap((parts) =>
    parts.items.map((item) => {
      sequence += 1;
      return {
        id: `cv-${shortId}-${sequence}`,
        purchaseRequestId,
        item: item.name,
        batch: parts.batch.batch,
        department,
        quotesReceived: quotesReceived(parts),
        quotesRequired: parts.batch.quotesRequired,
        ...(parts.batch.exempted ? { exempted: true } : {}),
        status: parts.batch.status,
        statusLabel: parts.batch.statusLabel,
        initiatedOn: formatShortDate(parts.batch.initiatedOn),
      } satisfies CanvassingCase;
    }),
  );
}

export function toCanvassingDetail(
  purchaseRequestId: string,
  department: string,
  items: ItemRow[],
  batches: BatchParts[],
): CanvassingDetail {
  const batchByNumber = new Map(
    batches.map((parts) => [parts.batch.batch, parts.batch]),
  );

  return {
    purchaseRequestId,
    department,
    items: items.map((item) => {
      const batch =
        item.batch === null ? undefined : batchByNumber.get(item.batch);

      // An item without a batch is not necessarily waiting for one — a
      // directly-sourced item is already on a purchase order and will never be
      // canvassed, so it reports its own state instead.
      const unbatched = UNBATCHED_LABEL[item.status] ?? {
        label: AWAITING_BATCH_LABEL,
        tone: "neutral" as StatusTone,
      };

      const status = batch?.statusLabel ?? unbatched.label;
      const statusTone: StatusTone = batch
        ? canvassingTone[batch.status]
        : unbatched.tone;

      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        batch: item.batch,
        status,
        statusTone,
      };
    }),
    batches: [...batches]
      .sort((a, b) => a.batch.batch - b.batch.batch)
      .map(toCanvassingBatch),
  };
}
