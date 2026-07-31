/**
 * Response contracts, mirroring FastAPI exactly — snake_case, `_id` keys.
 * These never reach React components; the mapper converts them to models
 * first.
 */

export interface VendorDto {
  _id: string;
  vendor_id: string;
  no: string;
  /** Some synced vendors have an empty name; the mapper falls back to `no`. */
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PaginationDto {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next_page: number | null;
  prev_page: number | null;
  search_term: string | null;
}

/** `Helper.paginate` wraps every list endpoint in this shape. */
export interface PaginatedDto<T> {
  data: T[];
  pagination: PaginationDto;
}
