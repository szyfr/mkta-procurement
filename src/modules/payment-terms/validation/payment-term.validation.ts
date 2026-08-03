import { ApiError } from "@/lib/api/errors";
import type { PaymentTermPayload } from "@/modules/payment-terms/models/payment-term";

/**
 * Request-body validation for the payment term BFF routes, which both accept
 * the same payload. FastAPI is lenient about it, so the check happens here
 * where a failure can be reported as a proper 422.
 */
export function parsePaymentTermPayload(body: unknown): PaymentTermPayload {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<PaymentTermPayload>;

  const title = payload.title?.trim();
  if (!title) throw invalid("Title is required.");

  return { title, description: payload.description?.trim() ?? "" };
}
