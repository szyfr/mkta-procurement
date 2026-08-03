import type { CreatePurchaseRequestItemDto } from "@/modules/purchase-requests/dto/create-purchase-request.dto";
import type {
  PriorityDto,
  PurchaseRequestStatusDto,
} from "@/modules/purchase-requests/dto/purchase-request.dto";

/**
 * `app/http/requests/update_pr_request.py:UpdatePRRequest`. Every field is
 * optional, but supplying `items` replaces the whole set — the backend
 * soft-deletes the existing rows and recreates them.
 */
export interface UpdatePurchaseRequestDto {
  requester_id?: string;
  department_id?: string;
  title?: string;
  date_needed?: string;
  priority?: PriorityDto;
  justification?: string;
  /**
   * Part of the backend contract, but never sent from here: it changes the
   * request's own status without touching its items, so transitions go through
   * `PATCH /purchase-requests/{id}/status/{status}` instead.
   */
  status?: PurchaseRequestStatusDto;
  items?: CreatePurchaseRequestItemDto[];
}
