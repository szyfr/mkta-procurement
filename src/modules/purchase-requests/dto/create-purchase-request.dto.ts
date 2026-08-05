import type { Priority } from "@/lib/types";

/** `app/http/requests/pr_request.py:itemRequest` */
export interface PurchaseRequestItemDto {
  material_id: string;
  quantity: number;
  vendor_id?: string | null;
}

/**
 * What the browser submits to create a request — `PRRequest` minus the one
 * field it is not allowed to choose.
 *
 * `requester_id` is filled in by the BFF from the signed-in user's session, so
 * it is absent here and added in `createPurchaseRequest`.
 */
export interface CreatePurchaseRequestInput {
  department_id: string;
  title: string;
  /** `YYYY-MM-DD`; pydantic coerces it to a datetime. */
  date_needed: string;
  priority: Priority;
  justification: string;
  items: PurchaseRequestItemDto[];
  /** Omitted for a draft — `PRRequest.status` defaults to `draft` upstream. */
  status?: "draft" | "pending";
}

/** `app/http/requests/pr_request.py:PRRequest`, as sent upstream. */
export interface CreatePurchaseRequestDto extends CreatePurchaseRequestInput {
  requester_id: string;
}
