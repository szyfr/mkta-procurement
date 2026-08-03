import { DEFAULT_SIGNED_IN_PATH } from "@/modules/auth/constants";

/**
 * Sanitizes the `?next=` destination carried through the login page.
 *
 * It arrives from the URL, so it is attacker-controlled: anything that could
 * resolve to another origin has to fall back to the default landing page or
 * the login screen becomes an open redirect. Only a single-slash absolute path
 * survives — `//evil.test` and `https://evil.test` are both protocol-relative
 * or absolute URLs once a browser resolves them.
 */
export function safeRedirectPath(
  next: string | string[] | undefined,
  fallback = DEFAULT_SIGNED_IN_PATH,
): string {
  const candidate = Array.isArray(next) ? next[0] : next;

  if (!candidate) return fallback;
  if (!candidate.startsWith("/")) return fallback;
  if (candidate.startsWith("//")) return fallback;
  // A backslash is normalized to a forward slash by some browsers, which turns
  // `/\evil.test` into another protocol-relative URL.
  if (candidate.startsWith("/\\")) return fallback;

  return candidate;
}
