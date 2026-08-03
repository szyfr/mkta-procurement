import { cookies } from "next/headers";

/**
 * Cookie plumbing for the BFF boundary.
 *
 * FastAPI issues its session cookie to *us*, not to the browser: the browser
 * only ever talks to this app's own origin, so nothing FastAPI sets ever
 * reaches it directly. Two things follow, and both live here — every upstream
 * call has to carry the caller's cookies forward by hand, and every cookie the
 * browser is meant to keep has to be re-issued on our origin.
 *
 * Server-only; importing this from a Client Component will fail the build.
 */

/**
 * The caller's cookies, serialized for an upstream `Cookie` header.
 *
 * Deliberately unguarded. `cookies()` is a request-time API, so reaching it
 * during a prerender is how Next.js learns the route has to be dynamic — and
 * since every upstream call now depends on who is asking, that is the right
 * answer for anything downstream of `serverFetch`. Catching the bailout here
 * would only turn it into an opaque fetch failure at build time.
 */
export async function forwardedCookieHeader(): Promise<string | undefined> {
  const header = (await cookies()).toString();

  return header || undefined;
}

/**
 * Pulls one cookie's value out of a set of upstream `Set-Cookie` lines.
 *
 * Only the name/value pair matters: the upstream attributes describe FastAPI's
 * own origin and are replaced wholesale when the cookie is re-issued on ours.
 */
export function readSetCookieValue(
  setCookies: string[],
  name: string,
): string | null {
  for (const line of setCookies) {
    const [pair] = line.split(";");
    const separator = pair.indexOf("=");

    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() !== name) continue;

    return decodeURIComponent(pair.slice(separator + 1).trim());
  }

  return null;
}
