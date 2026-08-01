import type { CanvassingMaterialDto } from "@/modules/canvassing/dto/canvassing.dto";

/**
 * `GET /purchase-requests/{id}/canvassing` — raw `purchase_request_items` docs
 * filtered to `is_needs_canvass`, each joined with its material. Unlike
 * `GET /canvassing` (`CanvassingEntryDto`), the item's own persisted status
 * comes through untouched rather than a status derived from quotations/awards.
 */

/**
 * Restated from the purchase-requests module rather than imported — see
 * `purchase-requests/dto/lookup.dto.ts` for why modules don't read each
 * other's DTOs.
 */
export type PurchaseRequestItemStatusDto =
  | "pending"
  | "rejected"
  | "completed"
  | "draft"
  | "canvassing"
  | "po-created"
  | "partially-completed"
  | "canceled";

export interface PurchaseRequestCanvassingItemDto {
  _id: string;
  quantity: number;
  status: PurchaseRequestItemStatusDto;
  is_needs_canvass: boolean;
  purchase_request_id: string;
  material_id: string;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
  /** Joined by this pipeline, preserving rows whose material is missing. */
  material?: CanvassingMaterialDto | null;
  /**
   * Also joined by this pipeline, but redundant with the PR detail the
   * detail page already fetches separately — left untyped and unused rather
   * than restating the whole purchase request contract for one dead field.
   */
  purchase_request?: unknown;
}
