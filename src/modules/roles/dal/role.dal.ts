import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import { clampPageSize, type Paginated } from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/roles/constants";
import type { CreateRoleDto } from "@/modules/roles/dto";
import type { Role, RoleDetail } from "@/modules/roles/models/role";

const NOT_FOUND = "Role not found";

export interface ListRolesQuery {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

export function listRoles(
  query: ListRolesQuery = {},
): Promise<Paginated<Role>> {
  return serverFetch<Paginated<Role>>("/roles", {
    query: {
      page: query.page ?? 1,
      page_size: clampPageSize(query.pageSize, DEFAULT_PAGE_SIZE),
      search: query.search || undefined,
    },
  });
}

export function getRole(id: string): Promise<RoleDetail> {
  assertObjectId(id, NOT_FOUND);
  return serverFetch<RoleDetail>(`/roles/${id}`);
}

export function createRole(input: CreateRoleDto): Promise<Role> {
  return serverFetch<Role>("/roles", {
    method: "POST",
    body: input,
  });
}
