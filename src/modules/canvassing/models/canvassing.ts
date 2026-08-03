import type { PageInfo } from "@/lib/api/pagination";
import type { StatusTone } from "@/lib/types";

/**
 * One row of the canvassing list, as the UI renders it.
 *
 * Batch, department and quote counts are deliberately absent rather than
 * nullable: `GET /canvassing` has no source for them at all, so the table
 * shows those columns empty instead of carrying dead fields around.
 */
export interface CanvassingEntry {
  id: string;
  purchaseRequestId: string;
  /**
   * The human-readable reference, e.g. `PR-2026-0803133440`. Falls back to
   * the Mongo id for rows whose request lookup found nothing.
   */
  purchaseRequestNo: string;
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
