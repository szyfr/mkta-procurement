import type { CanvassAwardDto } from "@/modules/canvassing/dto";
import type { CanvassAward } from "@/modules/canvassing/models/award";

/** DTO → model for a recorded award. */

export function toCanvassAward(dto: CanvassAwardDto): CanvassAward {
  return {
    id: dto._id,
    quotationId: dto.quotation_id,
    vendorId: dto.vendor_id,
    purchaseRequestId: dto.purchase_request_id,
    materialId: dto.material_id,
  };
}
