/**
 * Every BFF path the Vendors UI is allowed to call. All relative — the browser
 * only ever talks to this app's own origin.
 */

const BASE = "/api/vendors";

export const vendorEndpoints = {
  list: BASE,
} as const;
