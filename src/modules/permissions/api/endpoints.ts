/**
 * Every BFF path the Permissions UI is allowed to call. All relative — the
 * browser only ever talks to this app's own origin.
 */

const BASE = "/api/permissions";

export const permissionEndpoints = {
  list: BASE,
} as const;
