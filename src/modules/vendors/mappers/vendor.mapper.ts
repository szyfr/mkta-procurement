import type {
  PaginationDto,
  VendorDto,
} from "@/modules/vendors/dto/vendor.dto";
import type { PageInfo, Vendor } from "@/modules/vendors/models/vendor";
import { formatDate } from "@/modules/vendors/utils";

/** DTO → model. Keeps the transformation logic out of the DAL and components. */

export function toVendor(dto: VendorDto): Vendor {
  return {
    id: dto._id,
    vendorId: dto.vendor_id ?? "",
    no: dto.no ?? "",
    // Synced records occasionally arrive without a name; the number is the
    // only other thing that identifies the vendor to a user.
    name: dto.name?.trim() || dto.no || "",
    createdAt: formatDate(dto.created_at),
    updatedAt: formatDate(dto.updated_at),
  };
}

export function toPageInfo(pagination: PaginationDto): PageInfo {
  return {
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
    currentPage: pagination.current_page,
    pageSize: pagination.page_size,
    nextPage: pagination.next_page,
    prevPage: pagination.prev_page,
    searchTerm: pagination.search_term,
  };
}
