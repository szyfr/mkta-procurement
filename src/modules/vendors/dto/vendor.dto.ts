/**
 * Response contracts, mirroring FastAPI exactly — snake_case, `_id` keys.
 * These never reach React components; the mapper converts them to models
 * first. The pagination envelope they arrive in is shared — see
 * `lib/api/pagination`.
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
