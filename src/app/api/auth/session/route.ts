import { toErrorResponse } from "@/lib/api/errors";
import { getCurrentUser } from "@/modules/auth/dal/auth.dal";

/**
 * Who the caller is, according to the backend.
 *
 * This is the only way the browser learns it is signed in: the session cookie
 * is HttpOnly and the JWT is never handed over, so there is nothing to decode
 * client-side. An expired or forged cookie surfaces as the upstream 401.
 */

export async function GET() {
  try {
    return Response.json({ data: await getCurrentUser() });
  } catch (error) {
    return toErrorResponse(error);
  }
}
