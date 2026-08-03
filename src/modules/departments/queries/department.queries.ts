import { queryOptions } from "@tanstack/react-query";

import { fetchDepartments } from "@/modules/departments/api/client";

/**
 * Query definitions for the Departments UI.
 *
 * These live in the module rather than the component so the cache key and the
 * fetcher stay next to the rest of the department surface. The fetcher is
 * still the module's API client, which talks to the BFF — the FastAPI call
 * itself stays in the DAL, server-side.
 */

export const departmentKeys = {
  /** Prefix for every department query; invalidating it refetches all of them. */
  all: ["departments"] as const,
  list: (page: number) => ["departments", page] as const,
};

export function departmentListQuery(page: number) {
  return queryOptions({
    queryKey: departmentKeys.list(page),
    queryFn: ({ signal }) => fetchDepartments({ page, signal }),
  });
}
