/**
 * Purchase Requests module — public surface.
 *
 * Only the browser-safe pieces are re-exported here. The DAL is deliberately
 * left out: it reaches FastAPI and must be imported directly by Route Handlers
 * (`@/modules/purchase-requests/dal/...`) so it can never be pulled into a
 * client bundle through this barrel.
 */

export {
  type CreatePurchaseRequestPayload,
  createPurchaseRequest,
  fetchDepartmentOptions,
  fetchMaterialOptions,
  fetchPurchaseRequest,
  fetchPurchaseRequests,
  fetchVendorOptions,
  type ListPurchaseRequestsParams,
  type LookupParams,
  PurchaseRequestApiError,
  type UpdatePurchaseRequestPayload,
  updatePurchaseRequest,
} from "@/modules/purchase-requests/api/client";
export { purchaseRequestEndpoints } from "@/modules/purchase-requests/api/endpoints";
export {
  DEFAULT_PAGE_SIZE,
  LOOKUP_PAGE_SIZE,
  priorityToDto,
  purchaseRequestItemStatusLabels,
  purchaseRequestItemTone,
  purchaseRequestStatusLabels,
} from "@/modules/purchase-requests/constants";
export type {
  LookupOption,
  LookupPage,
  PageInfo,
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestList,
} from "@/modules/purchase-requests/models/purchase-request";
export {
  departmentOptionsQuery,
  purchaseRequestDetailQuery,
  purchaseRequestKeys,
  purchaseRequestListQuery,
} from "@/modules/purchase-requests/queries/purchase-request.queries";
export type { DraftLineItem } from "@/modules/purchase-requests/types";
export {
  formatShortDate,
  toDateInputValue,
} from "@/modules/purchase-requests/utils";
