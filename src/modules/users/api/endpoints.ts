const BASE = "/api/users";

/** Every BFF path the users feature may call. No `create` — the backend has no write endpoint yet. */
export const userEndpoints = {
  list: BASE,
  detail: (id: string) => `${BASE}/${encodeURIComponent(id)}`,
} as const;
