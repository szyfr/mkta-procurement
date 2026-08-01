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
  /**
   * Mongo id of the parent request. The list endpoint doesn't join the request,
   * so there is no human-readable reference (`PR-2026-0115`) to show yet.
   */
  purchaseRequestId: string;
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

/** One vendor's quote against a single canvassing item. */
export interface CanvassingQuotation {
  id: string;
  vendorId: string;
  /** Resolved via the module's own vendor lookup; falls back to the raw id. */
  vendor: string;
  referenceNo: string;
  date: string | null;
  deliveryDate: string | null;
  /** This item's price on the quotation — one quotation can price several items. */
  unitPrice: number;
  /** `unitPrice * quantity`, since the backend has no line total of its own. */
  total: number;
}

/** A PR item that needs canvassing, with whatever quotations exist for it. */
export interface PurchaseRequestCanvassingItem {
  id: string;
  materialId: string;
  item: string;
  unit: string | null;
  quantity: number;
  /** The item's own persisted status, e.g. "canvassing" — not a derived label. */
  status: string;
  vendorId: string | null;
  quotations: CanvassingQuotation[];
}

export interface PurchaseRequestCanvassing {
  purchaseRequestId: string;
  items: PurchaseRequestCanvassingItem[];
}
