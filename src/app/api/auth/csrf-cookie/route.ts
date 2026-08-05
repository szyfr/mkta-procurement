import { toErrorResponse } from "@/lib/api/errors";
import { requestCsrfToken } from "@/modules/auth/dal/auth.dal";
import { writeCsrfCookie } from "@/modules/auth/dal/auth-cookies";

/**
 * Primes the CSRF cookie ahead of a sign-in.
 *
 * FastAPI mints the token and hands it to the BFF; the BFF re-issues it on
 * this origin, HttpOnly. The browser gets a cookie it cannot read and does not
 * need to — the login route completes the double submit server-side.
 */

export async function GET() {
  try {
    await writeCsrfCookie(await requestCsrfToken());

    return Response.json({ data: null });
  } catch (error) {
    return toErrorResponse(error);
  }
}
