import type { PageInfo } from "@/lib/api/pagination";

/**
 * Reference-data picking, shared by every feature that has to resolve an id
 * against a collection too large to enumerate — materials, vendors, payment
 * terms. The picker that renders these is `components/shared/lookup-picker`.
 *
 * These started out inside the Purchase Requests module. They live here now
 * because Canvassing needs the same shapes, and a shared component may not
 * reach into a feature module for its own types.
 */

/** A selectable reference record — a department, material, vendor or payment term. */
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

/** Page size for the reference pickers. */
export const LOOKUP_PAGE_SIZE = 50;
