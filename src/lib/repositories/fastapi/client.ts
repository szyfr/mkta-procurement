import { ApiError } from "@/lib/http/errors";
import type { ApiErrorCode } from "@/types/api";

import type { RequestContext } from "../interfaces";

/**
 * HTTP transport for the FastAPI backend.
 *
 * This is written out in full rather than stubbed, because the transport is
 * where the migration risk actually sits — cookie forwarding, `Set-Cookie`
 * relaying and error translation are the parts that are easy to get subtly
 * wrong. Swapping backends should be a matter of filling in the repository
 * method bodies below, not designing this.
 */

const BASE_URL = process.env.FASTAPI_BASE_URL ?? "http://localhost:8000";

const CODE_BY_STATUS: Record<number, ApiErrorCode> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  422: "VALIDATION_FAILED",
};

export class FastApiClient {
  constructor(private readonly ctx: RequestContext) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body !== undefined && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    // The browser's session cookie is forwarded explicitly. A server-side fetch
    // has no cookie jar, so `credentials: "include"` would do nothing here.
    if (this.ctx.cookie) {
      headers.set("cookie", this.ctx.cookie);
    }

    const response = await fetch(new URL(path, BASE_URL), {
      ...init,
      headers,
      cache: "no-store",
    });

    // A refreshed or revoked session is relayed back to the browser, which is
    // what keeps HttpOnly auth transparent to React.
    for (const value of response.headers.getSetCookie()) {
      this.ctx.relaySetCookie?.(value);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(
        CODE_BY_STATUS[response.status] ?? "INTERNAL",
        extractMessage(payload) ??
          `Upstream request failed (${response.status}).`,
      );
    }

    return payload as T;
  }
}

/** FastAPI reports errors as `{ "detail": ... }`. */
function extractMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  return null;
}
