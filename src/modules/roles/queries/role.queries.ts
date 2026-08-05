import { queryOptions } from "@tanstack/react-query";
import { fetchRole, fetchRoles } from "@/modules/roles/api/client";

export const roleKeys = {
  all: ["roles"] as const,
  list: (page: number, search: string) =>
    [...roleKeys.all, "list", page, search] as const,
  detail: (id: string) => [...roleKeys.all, "detail", id] as const,
};

export function roleListQuery(page: number, search = "") {
  return queryOptions({
    queryKey: roleKeys.list(page, search),
    queryFn: ({ signal }) =>
      fetchRoles({ page, search: search || undefined, signal }),
  });
}

export function roleDetailQuery(id: string) {
  return queryOptions({
    queryKey: roleKeys.detail(id),
    queryFn: ({ signal }) => fetchRole(id, signal),
    enabled: id.length > 0,
  });
}
