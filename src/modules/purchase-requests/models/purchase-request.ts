import type { PageInfo } from "@/lib/api/pagination";
import type {
  Priority,
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestItemStatus,
  PurchaseRequestStatus,
  SourcingMode,
} from "@/lib/types";

/**
 * Domain objects used throughout the Purchase Requests UI.
 *
 * The shapes already live in `@/lib/types` because the wireframe components
 * were built against them; this module re-exports rather than duplicating, and
 * adds only the types that describe list results and reference data.
 */

export type {
  Priority,
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestItemStatus,
  PurchaseRequestStatus,
  SourcingMode,
};

export interface PurchaseRequestList {
  requests: PurchaseRequest[];
  page: PageInfo;
}

/** A selectable reference record — a department, material, or vendor. */
export interface LookupOption {
  id: string;
  label: string;
  /** Secondary line in the picker, e.g. a material or vendor number. */
  hint?: string;
  /** Materials only: drives the item's sourcing mode. */
  needsCanvass?: boolean;
  /** Materials only: unit of measure. */
  unit?: string | null;
  /**
   * Materials only: last known cost, used to prefill an estimate. Null for
   * every material currently synced from Business Central.
   */
  unitCost?: number | null;
}

export interface LookupPage {
  options: LookupOption[];
  page: PageInfo;
}

/**
 * What the UI submits to create a request. The BFF validates this shape before
 * it becomes a DTO, so it is shared by the API client and the Route Handlers
 * rather than owned by either.
 */
export interface CreatePurchaseRequestPayload {
  title: string;
  departmentId: string;
  dateNeeded: string;
  priority: "low" | "normal" | "high";
  justification: string;
  items: { materialId: string; quantity: number; vendorId?: string | null }[];
}

/**
 * An update carries edits only. Status changes are a separate call — see
 * `setPurchaseRequestStatus` in the module's API client.
 */
export type UpdatePurchaseRequestPayload = CreatePurchaseRequestPayload;

/**
 * The transitions the UI drives. The backend's enum is wider, but every other
 * status is reached through canvassing or PO processing rather than by someone
 * pressing a button on a request.
 */
export type SettablePurchaseRequestStatus = "pending" | "canceled";
