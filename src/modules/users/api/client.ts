import { bffRequest } from "@/lib/api/bff-client";
import type { Paginated } from "@/lib/api/pagination";
import { userEndpoints } from "@/modules/users/api/endpoints";
import type { UpdateUserRolesDto } from "@/modules/users/dto/update-user-roles.dto";
import type {
  UpdateUserRolesResult,
  User,
  UserDetail,
} from "@/modules/users/models/user";

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export function fetchUsers({ page, pageSize, signal }: ListUsersParams = {}) {
  return bffRequest<Paginated<User>>(userEndpoints.list, {
    query: { page, pageSize },
    signal,
  });
}

export function fetchUser(id: string, signal?: AbortSignal) {
  return bffRequest<UserDetail>(userEndpoints.detail(id), { signal });
}

export function updateUserRoles(id: string, payload: UpdateUserRolesDto) {
  return bffRequest<UpdateUserRolesResult>(userEndpoints.roles(id), {
    method: "PATCH",
    body: payload,
  });
}
