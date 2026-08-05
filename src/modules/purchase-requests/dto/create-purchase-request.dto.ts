import type { Priority } from "@/lib/types";

/**
 * `app/http/requests/pr_request.py:itemRequest`. `status` defaults to `draft`
 * upstream when omitted — the create form sets it explicitly so a submitted
 * request's items land as `pending` alongside the request itself, rather than
 * staying `draft` until canvassing or PO processing touches them.
 */
export interface PurchaseRequestItemDto {
  material_id: string;
  quantity: number;
  vendor_id?: string | null;
  status?: "draft" | "pending";
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
