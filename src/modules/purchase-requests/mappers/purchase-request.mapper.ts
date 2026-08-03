import { formatShortDate, toDateInputValue } from "@/lib/date";
import type { PurchaseRequest, PurchaseRequestItem } from "@/lib/types";
import {
  priorityFromDto,
  purchaseRequestStatusLabels,
} from "@/modules/purchase-requests/constants";
import type {
  DepartmentDto,
  MaterialDto,
  PurchaseRequestDetailDto,
  PurchaseRequestDto,
  PurchaseRequestItemDto,
  VendorDto,
} from "@/modules/purchase-requests/dto";
import type { LookupOption } from "@/modules/purchase-requests/models/purchase-request";

/**
 * DTO → model. Every difference between the FastAPI contract and what the UI
 * renders is resolved here, so components and Route Handlers stay free of
 * transformation logic.
 */

/** Some synced vendors have a blank name; their number is the next best label. */
function vendorName(vendor: VendorDto) {
  return vendor.name.trim() || vendor.no;
}

export function toPurchaseRequestItem(
  dto: PurchaseRequestItemDto,
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
    // The backend joins no vendor, so this is the raw id until it does.
    vendor: dto.vendor_id,
    sourcing: dto.is_needs_canvass ? "canvassing" : "direct",
    status: dto.status,
  };
}

export function toPurchaseRequest(
  dto: PurchaseRequestDto | PurchaseRequestDetailDto,
): PurchaseRequest {
  const itemDtos = "items" in dto ? dto.items : [];

  return {
    id: dto._id,
    no: dto.no,
    title: dto.title || null,
    requester: dto.requester_id,
    // Same as the item's vendor: no join exists, so the id stands in for the name.
    department: dto.department_id,
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
    items: itemDtos.map(toPurchaseRequestItem),
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
