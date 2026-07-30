import type { PurchaseRequest, PurchaseRequestItem } from "@/lib/types";
import {
  priorityFromDto,
  purchaseRequestStatusLabels,
} from "@/modules/purchase-requests/constants";
import type {
  DepartmentDto,
  MaterialDto,
  PaginationDto,
  PurchaseRequestDetailDto,
  PurchaseRequestDto,
  PurchaseRequestItemDto,
  VendorDto,
} from "@/modules/purchase-requests/dto";
import type {
  LookupOption,
  PageInfo,
} from "@/modules/purchase-requests/models/purchase-request";
import {
  formatShortDate,
  toDateInputValue,
} from "@/modules/purchase-requests/utils";

/**
 * DTO → model. Every difference between the FastAPI contract and what the UI
 * renders is resolved here, so components and Route Handlers stay free of
 * transformation logic.
 *
 * Several UI fields have no backend source at all and are deliberately left
 * unset rather than invented: submitted/completed/rejected dates, rejection
 * reasons, documents, comments, activity, and the action panel note.
 */

/** id → display name, so ids can be resolved without a lookup per row. */
export type NameLookup = ReadonlyMap<string, string>;

export function toDepartmentLookup(departments: DepartmentDto[]): NameLookup {
  return new Map(
    departments.map((department) => [department._id, department.title]),
  );
}

export function toVendorLookup(vendors: VendorDto[]): NameLookup {
  return new Map(vendors.map((vendor) => [vendor._id, vendorName(vendor)]));
}

/** Some synced vendors have a blank name; their number is the next best label. */
function vendorName(vendor: VendorDto) {
  return vendor.name.trim() || vendor.no;
}

export function toPageInfo(pagination: PaginationDto): PageInfo {
  return {
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
    currentPage: pagination.current_page,
    pageSize: pagination.page_size,
    nextPage: pagination.next_page,
    prevPage: pagination.prev_page,
  };
}

export function toPurchaseRequestItem(
  dto: PurchaseRequestItemDto,
  vendors: NameLookup,
): PurchaseRequestItem {
  const material = dto.material ?? null;

  return {
    id: dto._id,
    materialId: dto.material_id,
    // Materials are joined by the detail and items pipelines, but not by the
    // create response — fall back to the raw id so a row still renders.
    name: material?.description ?? dto.material_id,
    quantity: dto.quantity,
    unit: material?.uom ?? null,
    // `last_cost` is declared by the backend schema but absent from every
    // synced material, so this is null in practice.
    estimatedUnitCost: material?.last_cost ?? null,
    vendorId: dto.vendor_id,
    vendor: dto.vendor_id
      ? (vendors.get(dto.vendor_id) ?? dto.vendor_id)
      : null,
    sourcing: dto.is_needs_canvass ? "canvassing" : "direct",
    status: dto.status,
  };
}

interface PurchaseRequestContext {
  departments: NameLookup;
  vendors?: NameLookup;
}

export function toPurchaseRequest(
  dto: PurchaseRequestDto | PurchaseRequestDetailDto,
  context: PurchaseRequestContext,
): PurchaseRequest {
  const itemDtos = "items" in dto ? dto.items : [];
  const vendors = context.vendors ?? new Map<string, string>();

  return {
    // No human-readable request number exists on the backend, so the ObjectId
    // is both the route param and the displayed identifier.
    id: dto._id,
    title: dto.title || null,
    requester: dto.requester_id,
    department: context.departments.get(dto.department_id) ?? dto.department_id,
    departmentId: dto.department_id,
    // No amount is stored and no item cost is available to derive one.
    amount: null,
    priority: priorityFromDto[dto.priority] ?? "Normal",
    status: dto.status,
    statusLabel: purchaseRequestStatusLabels[dto.status] ?? dto.status,
    justification: dto.justification ?? "",
    dateNeeded: formatShortDate(dto.date_needed),
    dateNeededValue: toDateInputValue(dto.date_needed),
    createdAt: formatShortDate(dto.created_at),
    items: itemDtos.map((item) => toPurchaseRequestItem(item, vendors)),
  };
}

export function toDepartmentOption(dto: DepartmentDto): LookupOption {
  return { id: dto._id, label: dto.title, hint: dto.description || undefined };
}

export function toVendorOption(dto: VendorDto): LookupOption {
  return { id: dto._id, label: vendorName(dto), hint: dto.no };
}

export function toMaterialOption(dto: MaterialDto): LookupOption {
  return {
    id: dto._id,
    label: dto.description || dto.no,
    hint: dto.no,
    needsCanvass: dto.is_needs_canvass,
    unit: dto.uom || null,
    unitCost: dto.last_cost ?? null,
  };
}
