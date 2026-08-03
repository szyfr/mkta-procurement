import { formatDate } from "@/lib/date";
import type { VendorDto } from "@/modules/vendors/dto/vendor.dto";
import type { Vendor } from "@/modules/vendors/models/vendor";

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
