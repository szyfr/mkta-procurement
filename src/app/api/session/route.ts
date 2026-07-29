import { getSessionUser } from "@/lib/auth/session";
import { ok, withRoute } from "@/lib/http";

/**
 * Who the caller is. This is how React learns about the signed-in user — the
 * session cookie itself is HttpOnly and never readable from the browser.
 */
export const GET = withRoute(async () => ok(await getSessionUser()));
