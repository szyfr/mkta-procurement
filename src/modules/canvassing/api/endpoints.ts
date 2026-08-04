/**
 * Every BFF path the Canvassing UI is allowed to call. All relative — the
 * browser only ever talks to this app's own origin.
 */

const BASE = "/api/canvassing";

export const canvassingEndpoints = {
  list: BASE,
  quotations: `${BASE}/quotations`,
  quotation: (quotationId: string) => `${BASE}/quotations/${quotationId}`,
  /** The awarded quotation is the path segment; the items it wins are the body. */
  award: (quotationId: string) => `${BASE}/award/${quotationId}`,
} as const;
