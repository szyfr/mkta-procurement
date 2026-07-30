/**
 * Every BFF path the Departments UI is allowed to call. All relative — the
 * browser only ever talks to this app's own origin.
 */

const BASE = "/api/departments";

export const departmentEndpoints = {
  list: BASE,
  create: BASE,
  detail: (id: string) => `${BASE}/${encodeURIComponent(id)}`,
} as const;
