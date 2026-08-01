/**
 * Vendors have a module of their own, but a module never reads another
 * module's DTOs — see `purchase-requests/dto/lookup.dto.ts` for the same
 * convention. Restated here to resolve a quotation's `vendor_id` to a name.
 */

export interface VendorDto {
  _id: string;
  vendor_id: string;
  no: string;
  /** Some synced vendors have an empty name; fall back to `no`. */
  name: string;
  created_at: string;
  updated_at: string;
}
