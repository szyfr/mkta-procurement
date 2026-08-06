import { cookies } from "next/headers";

/**
 * Cookie plumbing for the BFF boundary.
 *
 * FastAPI issues its session cookie to *us*, not the browser — the browser
 * only talks to this app's own origin, so nothing FastAPI sets reaches it
 * directly. Two things follow, and both live here: every upstream call must
 * carry the caller's cookies forward by hand, and every cookie the browser
 * keeps must be re-issued on our origin.
 *
 * Server-only; importing from a Client Component fails the build.
 */

/**
 * The caller's cookies, serialized for an upstream `Cookie` header.
 *
 * Deliberately unguarded: `cookies()` is a request-time API, so reaching it
 * during a prerender is how Next.js learns the route must be dynamic —
 * correct, since every upstream call depends on who's asking. Catching the
 * bailout here would just turn it into an opaque fetch failure at build time.
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
