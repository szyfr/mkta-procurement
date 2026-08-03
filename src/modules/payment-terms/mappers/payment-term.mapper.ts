import type { LookupOption } from "@/lib/lookup";
import type { PaymentTermDto } from "@/modules/payment-terms/dto/payment-term.dto";

/** DTO → model. Keeps the transformation logic out of the DAL and components. */

export function toPaymentTermOption(dto: PaymentTermDto): LookupOption {
  return {
    id: dto._id,
    // Seeded terms occasionally have a blank title; the description is the
    // only other thing that identifies the term to a user.
    label: dto.title?.trim() || dto.description || dto._id,
    hint: dto.description || undefined,
  };
}
