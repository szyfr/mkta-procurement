/**
 * Vendors module — public surface.
 *
 * Only the browser-safe pieces are re-exported here. The DAL is deliberately
 * left out: it reaches FastAPI and must be imported directly by Route Handlers
 * (`@/modules/vendors/dal/...`) so it can never be pulled into a client bundle
 * through this barrel.
 */

export {
  fetchVendors,
  type ListVendorsParams,
  VendorApiError,
} from "@/modules/vendors/api/client";
export { vendorEndpoints } from "@/modules/vendors/api/endpoints";
export { DEFAULT_PAGE_SIZE } from "@/modules/vendors/constants";
export type {
  PageInfo,
  Vendor,
  VendorList,
} from "@/modules/vendors/models/vendor";
export {
  vendorKeys,
  vendorListQuery,
} from "@/modules/vendors/queries/vendor.queries";
