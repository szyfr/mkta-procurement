import { bffRequest } from "@/lib/api/bff-client";
import { departmentEndpoints } from "@/modules/departments/api/endpoints";
import type {
  Department,
  DepartmentList,
  DepartmentPayload,
} from "@/modules/departments/models/department";

/**
 * Department calls against the BFF. Runs in the browser and knows nothing about
 * FastAPI — Route Handlers return models already, so responses pass straight
 * through. The transport itself lives in `lib/api/bff-client`.
 */

export interface ListDepartmentsParams {
  page?: number;
  signal?: AbortSignal;
}

export function fetchDepartments({ page, signal }: ListDepartmentsParams = {}) {
  return bffRequest<DepartmentList>(departmentEndpoints.list, {
    query: { page },
    signal,
  });
}

export function createDepartment(payload: DepartmentPayload) {
  return bffRequest<Department>(departmentEndpoints.create, {
    method: "POST",
    body: payload,
  });
}

export function updateDepartment(id: string, payload: DepartmentPayload) {
  return bffRequest<Department>(departmentEndpoints.detail(id), {
    method: "PUT",
    body: payload,
  });
}

export function deleteDepartment(id: string) {
  return bffRequest<null>(departmentEndpoints.detail(id), { method: "DELETE" });
}
