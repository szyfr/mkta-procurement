import type { PageInfo } from "@/lib/api/pagination";

/** Domain object used throughout the Vendors UI. */
export interface Vendor {
  id: string;
  /** Upstream ERP identifier, distinct from the Mongo `_id`. */
  vendorId: string;
  no: string;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface VendorList {
  vendors: Vendor[];
  page: PageInfo;
}
