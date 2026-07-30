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
  /** `"pending"` is sent when submitting a draft for approval. */
  status?: PurchaseRequestStatusDto;
  items?: CreatePurchaseRequestItemDto[];
}
