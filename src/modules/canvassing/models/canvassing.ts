import type { PageInfo } from "@/lib/api/pagination";
import type { StatusTone } from "@/lib/types";

/**
 * One row of the canvassing list, as the UI renders it.
 *
 * Batch and quote counts are deliberately absent rather than nullable:
 * `GET /canvassing` has no source for them at all, so the table shows those
 * columns empty instead of carrying dead fields around.
 */
export interface CanvassingEntry {
  id: string;
  /** Mongo id of the parent request — what the detail routes take. */
  purchaseRequestId: string;
  /**
   * Human-readable reference, e.g. "PR-2026-0801152847". Null when the request
   * join found nothing, in which case the row falls back to the id.
   */
  purchaseRequestNo: string | null;
  item: string;
  quantity: number;
  unit: string | null;
  /** Already display copy — the backend derives the label per row. */
  status: string;
  statusTone: StatusTone;
  initiatedOn: string | null;
}

export interface CanvassingList {
  entries: CanvassingEntry[];
  page: PageInfo;
}
