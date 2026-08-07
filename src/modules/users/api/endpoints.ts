const BASE = "/api/users";

/** Every BFF path the users feature may call. No `create` — the backend has no create endpoint yet. */
export const userEndpoints = {
  list: BASE,
  detail: (id: string) => `${BASE}/${encodeURIComponent(id)}`,
  roles: (id: string) => `${BASE}/${encodeURIComponent(id)}/roles`,
} as const;
