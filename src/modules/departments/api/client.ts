import { bffRequest } from "@/lib/api/bff-client";
import type { Paginated } from "@/lib/api/pagination";
import { departmentEndpoints } from "@/modules/departments/api/endpoints";
import type {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from "@/modules/departments/dto";
import type { Department } from "@/modules/departments/models/department";

/**
 * Department calls against the BFF. Runs in the browser and knows nothing about
 * FastAPI's address — but it does speak FastAPI's shapes, because Route
 * Handlers pass the upstream response through untouched. The transport itself
 * lives in `lib/api/bff-client`.
 */

export interface ListDepartmentsParams {
  page?: number;
  pageSize?: number;
  signal?: AbortSignal;
}

export function fetchDepartments({
  page,
  pageSize,
  signal,
}: ListDepartmentsParams = {}) {
  return bffRequest<Paginated<Department>>(departmentEndpoints.list, {
    query: { page, pageSize },
    signal,
  });
}

export function createDepartment(payload: CreateDepartmentDto) {
  return bffRequest<Department>(departmentEndpoints.create, {
    method: "POST",
    body: payload,
  });
}

export function updateDepartment(id: string, payload: UpdateDepartmentDto) {
  return bffRequest<Department>(departmentEndpoints.detail(id), {
    method: "PUT",
    body: payload,
  });
}

export function deleteDepartment(id: string) {
  return bffRequest<null>(departmentEndpoints.detail(id), { method: "DELETE" });
}
