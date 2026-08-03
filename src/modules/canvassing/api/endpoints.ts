/**
 * Every BFF path the Canvassing UI is allowed to call. All relative — the
 * browser only ever talks to this app's own origin.
 */

const BASE = "/api/canvassing";

export const canvassingEndpoints = {
  list: BASE,
  quotations: `${BASE}/quotations`,
} as const;
