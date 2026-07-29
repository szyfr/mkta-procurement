/**
 * Server-side configuration for reaching FastAPI.
 *
 * Nothing here may be imported from a Client Component — the base URL is the
 * one detail the BFF exists to keep off the browser.
 */

/** Where the BFF reaches FastAPI. Trailing slashes are stripped. */
export function getApiBaseUrl() {
  const baseUrl = process.env.FASTAPI_BASE_URL;

  if (!baseUrl) {
    throw new Error("FASTAPI_BASE_URL is not set");
  }

  return baseUrl.replace(/\/+$/, "");
}

/**
 * Stand-in for the authenticated subject. Auth is out of scope, but FastAPI
 * requires `requester_id` on every purchase request, so the BFF supplies it
 * server-side rather than letting the browser choose one.
 */
export function getRequesterId() {
  return process.env.PURCHASE_REQUEST_REQUESTER_ID ?? "1";
}

/** Upstream requests are abandoned after this long. */
export const REQUEST_TIMEOUT_MS = 15_000;
