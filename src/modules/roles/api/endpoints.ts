/**
 * Every BFF path the Roles UI is allowed to call. All relative — the browser
 * only ever talks to this app's own origin.
 */

const BASE = "/api/roles";

export const roleEndpoints = {
  list: BASE,
  detail: (id: string) => `${BASE}/${encodeURIComponent(id)}`,
} as const;
