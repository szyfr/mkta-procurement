import type {
  AwardQuotationResponseDto,
  CanvassAwardDto,
} from "@/modules/canvassing/dto";
import type {
  AwardQuotationResult,
  CanvassAward,
} from "@/modules/canvassing/models/award";

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

export function toAwardQuotationResult(
  dto: AwardQuotationResponseDto,
): AwardQuotationResult {
  return {
    awards: dto.awards.map(toCanvassAward),
    issues: dto.issues.map((issue) => ({
      itemId: issue.item_id,
      message: issue.message,
    })),
  };
}
