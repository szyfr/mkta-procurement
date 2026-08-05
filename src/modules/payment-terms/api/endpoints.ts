/**
 * Every BFF path the Payment Terms UI is allowed to call. All relative — the
 * browser only ever talks to this app's own origin.
 */

const BASE = "/api/payment-terms";

export const paymentTermEndpoints = {
  list: BASE,
  create: BASE,
  detail: (id: string) => `${BASE}/${encodeURIComponent(id)}`,
} as const;
