/**
 * Names and paths the auth flow is built around.
 *
 * The cookie names match FastAPI's, because the BFF re-issues the same two
 * cookies on this app's origin rather than inventing its own — one place to
 * look when comparing the two sides.
 */

/** Carries the JWT. HttpOnly on our origin; the browser never reads it. */
export const SESSION_COOKIE = "access_token";

/** The CSRF token FastAPI mints, kept for the double submit below. */
export const CSRF_COOKIE = "XSRF-TOKEN";

/** Header `validate_xsrf` compares the CSRF cookie against. */
export const CSRF_HEADER = "X-XSRF-TOKEN";

export const LOGIN_PATH = "/login";

/** Where a signed-in user lands when no other destination was requested. */
export const DEFAULT_SIGNED_IN_PATH = "/dashboard";

/** Search param carrying the page a signed-out user was turned away from. */
export const REDIRECT_PARAM = "next";
