/**
 * Every BFF path the payment terms lookup may call. All relative — the browser
 * only ever talks to this app's own origin.
 */

const BASE = "/api/payment-terms";

export const paymentTermEndpoints = {
  options: BASE,
} as const;
