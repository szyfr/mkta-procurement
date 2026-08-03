import { formatDate } from "@/lib/date";
import type { LookupOption } from "@/lib/lookup";
import type { PaymentTermDto } from "@/modules/payment-terms/dto/payment-term.dto";
import type { PaymentTerm } from "@/modules/payment-terms/models/payment-term";

/** DTO → model. Keeps the transformation logic out of the DAL and components. */

export function toPaymentTerm(dto: PaymentTermDto): PaymentTerm {
  return {
    id: dto._id,
    title: dto.title,
    description: dto.description ?? "",
    createdAt: formatDate(dto.created_at),
    updatedAt: formatDate(dto.updated_at),
  };
}

export function toPaymentTermOption(dto: PaymentTermDto): LookupOption {
  return {
    id: dto._id,
    // Seeded terms occasionally have a blank title; the description is the
    // only other thing that identifies the term to a user.
    label: dto.title?.trim() || dto.description || dto._id,
    hint: dto.description || undefined,
  };
}
