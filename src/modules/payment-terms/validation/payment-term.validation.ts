import { parseTitleDescriptionPayload } from "@/lib/api/validation";
import type { CreatePaymentTermDto } from "@/modules/payment-terms/dto";

/**
 * Request-body validation for the payment term BFF routes, which both accept
 * the same payload.
 */
export function parsePaymentTermPayload(body: unknown): CreatePaymentTermDto {
  return parseTitleDescriptionPayload<CreatePaymentTermDto>(body);
}
