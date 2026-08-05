/**
 * The `/vendors` response, verbatim — snake_case, `_id` keys, exactly what
 * FastAPI sends. List responses arrive inside the shared pagination envelope,
 * see `lib/api/pagination`.
 *
 * Vendors are synced from the ERP and there are no write endpoints, so there
 * is no request DTO to go with this.
 */
export interface Vendor {
  _id: string;
  /** Upstream ERP identifier, distinct from the Mongo `_id`. */
  vendor_id: string;
  no: string;
  /** Some synced vendors arrive blank; the tables fall back to `no`. */
  name: string;
  created_at: string;
  updated_at: string;
}
