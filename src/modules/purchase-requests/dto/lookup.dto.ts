/**
 * Reference data the Purchase Requests screens need in order to resolve ids to
 * names and to populate the create form. Departments, materials and vendors do
 * not have modules of their own yet; these DTOs stay scoped to this module
 * until they do.
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
