/**
 * Response contracts, mirroring FastAPI exactly — snake_case, `_id` keys, and
 * the backend's own enum values. These never reach React components; the
 * mapper converts them to models first.
 */

export type PriorityDto = "low" | "normal" | "high";

/** `app/schemas/purchase_request_schema.py:Status` */
export type PurchaseRequestStatusDto =
  | "draft"
  | "canvassing"
  | "po-created"
  | "partially-completed"
  | "completed"
  | "rejected";

/** `app/schemas/purchase_request_item_schema.py:Status` — a wider set than the PR's. */
export type PurchaseRequestItemStatusDto =
  | "pending"
  | "draft"
  | "canvassing"
  | "po-created"
  | "partially-completed"
  | "completed"
  | "rejected";

export interface MaterialDto {
  _id: string;
  no: string;
  description: string;
  inventory: number;
  uom: string;
  inv_post_grp: string;
  is_needs_canvass: boolean;
  /** Declared by the backend schema but absent from synced documents. */
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

export interface PaginationDto {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next_page: number | null;
  prev_page: number | null;
  search_term: string | null;
}

/** `Helper.paginate` wraps every list endpoint in this shape. */
export interface PaginatedDto<T> {
  data: T[];
  pagination: PaginationDto;
}
