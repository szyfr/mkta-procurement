import "server-only";

import { createFastApiRepositories } from "./fastapi";
import type { Repositories, RequestContext } from "./interfaces";
import { createSqliteRepositories } from "./sqlite";

/**
 * The single point at which the application decides which backend it is
 * talking to. Nothing else in the codebase branches on this — route handlers
 * receive a `Repositories` bundle and cannot tell the difference.
 *
 * Replacing SQLite with FastAPI is therefore a change to one environment
 * variable plus the method bodies in `./fastapi`.
 */

export type BackendKind = "sqlite" | "fastapi";

export function activeBackend(): BackendKind {
  return process.env.PROCUREMENT_BACKEND === "fastapi" ? "fastapi" : "sqlite";
}

export function getRepositories(ctx: RequestContext): Repositories {
  return activeBackend() === "fastapi"
    ? createFastApiRepositories(ctx)
    : createSqliteRepositories(ctx);
}

/**
 * Builds the per-request context from the incoming request. Cookies are read
 * from the raw header so they can be forwarded verbatim — the BFF never parses
 * or inspects the session token, it only carries it.
 */
export function requestContextFrom(
  request: Request,
  relaySetCookie?: (value: string) => void,
): RequestContext {
  return {
    cookie: request.headers.get("cookie"),
    relaySetCookie,
  };
}
