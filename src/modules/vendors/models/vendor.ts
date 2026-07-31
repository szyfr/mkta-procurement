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

/** Page metadata, mapped from the backend's pagination envelope. */
export interface PageInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  nextPage: number | null;
  prevPage: number | null;
  /** Echoed back by the backend. Unused until vendor search ships. */
  searchTerm: string | null;
}

export interface VendorList {
  vendors: Vendor[];
  page: PageInfo;
}
