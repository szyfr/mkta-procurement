import { ApiError } from "@/lib/api/errors";
import type { Credentials } from "@/modules/auth/models/session";

/**
 * Request-body validation for `POST /api/auth/login`.
 *
 * Presence only. FastAPI owns the actual rules (it rejects passwords under six
 * characters) and its 422 already names the offending field, so duplicating
 * them here would only risk the two drifting apart.
 */
export function parseCredentials(body: unknown): Credentials {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<Credentials>;

  const email = payload.email?.trim();
  if (!email) throw invalid("Email is required.");

  // Not trimmed: leading and trailing spaces are part of a password.
  const password = payload.password;
  if (!password) throw invalid("Password is required.");

  return { email, password };
}
