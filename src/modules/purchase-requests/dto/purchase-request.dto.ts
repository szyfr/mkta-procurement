/**
 * Response contracts, mirroring FastAPI exactly — snake_case, `_id` keys, and
 * the backend's own enum values. These never reach React components; the
 * mapper converts them to models first. The pagination envelope they arrive in
 * is shared — see `lib/api/pagination`.
 */

export type PriorityDto = "low" | "normal" | "high";

/** `app/schemas/purchase_request_schema.py:Status`. */
export type PurchaseRequestStatusDto =
  | "draft"
  | "pending"
  | "canvassing"
  | "po-created"
  | "partially-completed"
  | "completed"
  | "rejected"
  | "canceled";

/** `app/schemas/purchase_request_item_schema.py:Status` — a wider set than the PR's. */
export type PurchaseRequestItemStatusDto =
  | "pending"
  | "draft"
  | "canvassing"
  | "quotation-awarded"
  | "po-created"
  | "partially-completed"
  | "completed"
  | "rejected"
  | "canceled";

export interface MaterialDto {
  _id: string;
  no: string;
  description: string;
  inventory: number;
  uom: string;
  inv_post_grp: string;
  is_needs_canvass: boolean;
  last_cost?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRequestItemDto {
  _id: string;
  quantity: number;
  status: PurchaseRequestItemStatusDto;
  is_needs_canvass: boolean | null;
  purchase_request_id: string;
  material_id: string;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
  /** Joined by the detail and items pipelines only. */
  material?: MaterialDto | null;
}

export interface PurchaseRequestDto {
  _id: string;
  no: string;
  title: string;
  date_needed: string;
  priority: PriorityDto;
  justification: string;
  status: PurchaseRequestStatusDto;
  requester_id: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}

/** `GET /purchase-requests/{id}` — the list endpoint returns no items. */
export interface PurchaseRequestDetailDto extends PurchaseRequestDto {
  items: PurchaseRequestItemDto[];
}
