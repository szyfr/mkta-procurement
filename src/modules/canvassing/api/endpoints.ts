/**
 * Every BFF path the Canvassing UI is allowed to call. All relative — the
 * browser only ever talks to this app's own origin.
 */

const BASE = "/api/canvassing";

export const canvassingEndpoints = {
  list: BASE,
  /**
   * Nested under `/api/purchase-requests` rather than `BASE` — mirrors
   * FastAPI's own nesting of `GET /purchase-requests/{id}/canvassing`.
   */
  forPurchaseRequest: (purchaseRequestId: string) =>
    `/api/purchase-requests/${encodeURIComponent(purchaseRequestId)}/canvassing`,
} as const;
