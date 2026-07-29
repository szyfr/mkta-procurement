import "server-only";

import { createFastApiRepositories } from "./fastapi";
import type { Repositories, RequestContext } from "./interfaces";
import { createUnimplementedRepositories } from "./unimplemented";

/**
 * The single point at which the application decides where its data comes from.
 * Nothing else in the codebase branches on it — route handlers receive a
 * `Repositories` bundle and cannot tell one source from the other.
 *
 * The split is a statement of what the backend currently implements: purchase
 * requests and reference data are real. Everything else has no upstream
 * endpoint, so its reads answer empty and the UI renders its own empty state
 * rather than fake data or an error; the writes still throw `NOT_IMPLEMENTED`.
 * As FastAPI grows endpoints, entries move from `./unimplemented` to
 * `./fastapi` and nothing above this line changes.
 */

export function getRepositories(ctx: RequestContext): Repositories {
    return {
        ...createUnimplementedRepositories(),
        ...createFastApiRepositories(ctx),
    };
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
