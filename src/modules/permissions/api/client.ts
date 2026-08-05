import { bffRequest } from "@/lib/api/bff-client";
import type { Paginated } from "@/lib/api/pagination";
import { permissionEndpoints } from "@/modules/permissions/api/endpoints";
import type { Permission } from "@/modules/permissions/models/permission";

export interface ListPermissionsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  signal?: AbortSignal;
}

export function fetchPermissions({
  page,
  pageSize,
  search,
  signal,
}: ListPermissionsParams = {}) {
  return bffRequest<Paginated<Permission>>(permissionEndpoints.list, {
    query: { page, pageSize, search },
    signal,
  });
}
