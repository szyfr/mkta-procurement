import { bffRequest } from "@/lib/api/bff-client";
import type { Paginated } from "@/lib/api/pagination";
import { roleEndpoints } from "@/modules/roles/api/endpoints";
import type { CreateRoleDto } from "@/modules/roles/dto";
import type { Role, RoleDetail } from "@/modules/roles/models/role";

export interface ListRolesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

export function fetchRoles({
  page,
  pageSize,
  search,
  signal,
}: ListRolesParams = {}) {
  return bffRequest<Paginated<Role>>(roleEndpoints.list, {
    query: { page, pageSize, search },
    signal,
  });
}

export function fetchRole(id: string, signal?: AbortSignal) {
  return bffRequest<RoleDetail>(roleEndpoints.detail(id), { signal });
}

export function createRole(payload: CreateRoleDto) {
  return bffRequest<Role>(roleEndpoints.create, {
    method: "POST",
    body: payload,
  });
}
