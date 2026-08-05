import { type NextRequest, NextResponse } from "next/server";

import {
  LOGIN_PATH,
  REDIRECT_PARAM,
  SESSION_COOKIE,
} from "@/modules/auth/constants";

/**
 * The cheap half of route protection: turn away requests that carry no session
 * cookie at all, before a protected page renders.
 *
 * It is an optimistic check and nothing more. The cookie's presence says the
 * user signed in at some point, not that the token is still valid — only
 * FastAPI can say that, so every protected shell re-checks with the DAL. The
 * split is what the Next.js auth guide recommends, and it is also what keeps
 * this from looping: a stale cookie gets past here, is rejected by the layout,
 * and lands on a login page that verifies the session itself rather than
 * bouncing back on cookie presence.
 *
 * Deliberately not handling `/api/*`: those routes answer 401 through the
 * error envelope the client already understands, and `/api/auth/*` has to stay
 * reachable while signed out.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL(LOGIN_PATH, request.url);

  // So the user resumes where they were aimed once they sign in.
  login.searchParams.set(REDIRECT_PARAM, `${pathname}${search}`);

  return NextResponse.redirect(login);
}

export const config = {
  /**
   * Everything except the login page, the BFF, Next's own assets and static
   * files. Without the exclusions this would redirect the CSS and JS the login
   * page needs to render.
   */
  matcher: [
    "/((?!login|api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
