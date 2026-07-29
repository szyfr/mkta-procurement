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
 * adds only the types that describe list results.
 */

export type {
  Priority,
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestItemStatus,
  PurchaseRequestStatus,
  SourcingMode,
};

/** Page metadata, mapped from the backend's pagination envelope. */
export interface PageInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  nextPage: number | null;
  prevPage: number | null;
}

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
}

export interface LookupPage {
  options: LookupOption[];
  page: PageInfo;
}
