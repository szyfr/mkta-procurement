import type { Priority } from "@/lib/types";
import type { PurchaseRequestItemDto } from "@/modules/purchase-requests/dto/create-purchase-request.dto";

/**
 * `app/http/requests/update_pr_request.py:UpdatePRRequest`. Every field is
 * optional, but supplying `items` replaces the whole set — the backend
 * soft-deletes the existing rows and recreates them.
 *
 * `status` is part of the backend contract and deliberately not part of this
 * one: changing it here would leave the request's items behind, so transitions
 * go through `PATCH /purchase-requests/{id}/status/{status}` instead.
 */
export interface UpdatePurchaseRequestDto {
  department_id?: string;
  title?: string;
  date_needed?: string;
  priority?: Priority;
  justification?: string;
  items?: PurchaseRequestItemDto[];
}
