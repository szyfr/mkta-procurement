/**
 * Purchase Requests module — public surface.
 *
 * Only the browser-safe pieces are re-exported here. The DAL is deliberately
 * left out: it reaches FastAPI and must be imported directly by Route Handlers
 * (`@/modules/purchase-requests/dal/...`) so it can never be pulled into a
 * client bundle through this barrel.
 */

export {
  createPurchaseRequest,
  fetchDepartmentOptions,
  fetchMaterialOptions,
  fetchVendorOptions,
  setPurchaseRequestStatus,
  updatePurchaseRequest,
} from "@/modules/purchase-requests/api/client";
export {
  LOOKUP_PAGE_SIZE,
  priorityToDto,
  purchaseRequestItemStatusLabels,
  purchaseRequestItemTone,
  purchaseRequestStatusLegend,
  purchaseRequestTone,
} from "@/modules/purchase-requests/constants";
export type {
  CreatePurchaseRequestPayload,
  LookupOption,
  PurchaseRequest,
  PurchaseRequestStatus,
  SettablePurchaseRequestStatus,
  UpdatePurchaseRequestPayload,
} from "@/modules/purchase-requests/models/purchase-request";
export type { PurchaseRequestListFilters } from "@/modules/purchase-requests/queries/purchase-request.queries";
export {
  departmentOptionsQuery,
  purchaseRequestDetailQuery,
  purchaseRequestKeys,
  purchaseRequestListQuery,
} from "@/modules/purchase-requests/queries/purchase-request.queries";
export type { DraftLineItem } from "@/modules/purchase-requests/types";
