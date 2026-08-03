/**
 * Reference data the Purchase Requests screens need in order to resolve ids to
 * names and to populate the create form.
 *
 * Departments and vendors have modules of their own, but a module never reads
 * another module's DTOs: these screens are served by this module's own lookup
 * routes, so the upstream contracts they depend on are restated here rather
 * than imported across the boundary.
 */

export interface DepartmentDto {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface VendorDto {
  _id: string;
  vendor_id: string;
  no: string;
  /** Some synced vendors have an empty name; fall back to `no`. */
  name: string;
  created_at: string;
  updated_at: string;
}
