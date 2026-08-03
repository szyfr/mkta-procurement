import { toErrorResponse } from "@/lib/api/errors";
import { signOut } from "@/modules/auth/dal/auth.dal";
import { clearAuthCookies } from "@/modules/auth/dal/auth-cookies";

/**
 * Ends the session.
 *
 * Our cookies are cleared whatever the upstream call does. A user who asked to
 * sign out must end up signed out of this app even if FastAPI is unreachable —
 * leaving a live session cookie behind on a failed logout is the worse outcome.
 */

export async function POST() {
  try {
    await signOut().catch(() => {});
    await clearAuthCookies();

    return Response.json({ data: null });
  } catch (error) {
    return toErrorResponse(error);
  }
}
