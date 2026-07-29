/**
 * Every BFF path the Purchase Requests UI is allowed to call. All relative —
 * the browser only ever talks to this app's own origin.
 */

const BASE = "/api/purchase-requests";

export const purchaseRequestEndpoints = {
  list: BASE,
  create: BASE,
  detail: (id: string) => `${BASE}/${encodeURIComponent(id)}`,
  itemRequests: `${BASE}/item-requests`,
  departments: `${BASE}/lookups/departments`,
  materials: `${BASE}/lookups/materials`,
  vendors: `${BASE}/lookups/vendors`,
} as const;
