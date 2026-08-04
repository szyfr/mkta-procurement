import type { PriorityDto } from "@/modules/purchase-requests/dto/purchase-request.dto";

/** `app/http/requests/pr_request.py:itemRequest` */
export interface CreatePurchaseRequestItemDto {
  material_id: string;
  quantity: number;
  vendor_id?: string | null;
}

/**
 * `app/http/requests/pr_request.py:PRRequest`.
 *
 * `requester_id` is filled in by the BFF from the signed-in user's session,
 * not sent by the browser — see `createPurchaseRequest` in
 * `purchase-request.dal`.
 */
export interface CreatePurchaseRequestDto {
  requester_id: string;
  department_id: string;
  title: string;
  /** `YYYY-MM-DD`; pydantic coerces it to a datetime. */
  date_needed: string;
  priority: PriorityDto;
  justification: string;
  items: CreatePurchaseRequestItemDto[];
}
