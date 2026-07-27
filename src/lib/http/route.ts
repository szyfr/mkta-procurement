import "server-only";

import { getCurrentUser } from "@/lib/auth/session";
import type { Repositories } from "@/lib/repositories";
import { getRepositories, requestContextFrom } from "@/lib/repositories";
import type { Actor } from "@/types";

import { withRoute } from "./responses";

/**
 * Assembles the four things every handler needs — the request, its resolved
 * params, the repository bundle and the caller — and wraps the result in the
 * shared error envelope.
 *
 * The point is that handlers stay thin: parse, call one repository method,
 * return. Resolving `Repositories` here is also what keeps the choice of
 * backend invisible to routes.
 */

export interface RouteArgs<P> {
  request: Request;
  params: P;
  repos: Repositories;
  actor: Actor;
}

export function defineRoute<P = Record<string, never>>(
  handler: (args: RouteArgs<P>) => Promise<Response>,
) {
  return withRoute(
    async (request: Request, context?: { params: Promise<P> }) => {
      // Next.js 16 makes route params a promise.
      const params = context ? await context.params : ({} as P);
      const actor = await getCurrentUser();
      const repos = getRepositories(requestContextFrom(request));

      return handler({ request, params, repos, actor });
    },
  );
}
