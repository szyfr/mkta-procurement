import { queryOptions } from "@tanstack/react-query";

import { fetchSession } from "@/modules/auth/api/client";

/**
 * Query definitions for the session.
 *
 * Nothing about the signed-in user is persisted client-side — this cache is
 * per-tab and rebuilt from `/api/auth/session` on load, which keeps the backend
 * the only authority on whether the caller is still signed in.
 */

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export function sessionQuery() {
  return queryOptions({
    queryKey: authKeys.session(),
    queryFn: ({ signal }) => fetchSession(signal),
    // A revoked or expired session should surface promptly rather than sit
    // behind the app-wide 30s window.
    staleTime: 0,
    // A 401 already resolves to `null`; a retry here would only repeat a real
    // outage on the critical path.
    retry: false,
  });
}
