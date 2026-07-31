/**
 * Departments module — public surface.
 *
 * Only the browser-safe pieces are re-exported here. The DAL is deliberately
 * left out: it reaches FastAPI and must be imported directly by Route
 * Handlers (`@/modules/departments/dal/...`) so it can never be pulled into a
 * client bundle through this barrel.
 */

export {
  createDepartment,
  DepartmentApiError,
  type DepartmentPayload,
  deleteDepartment,
  fetchDepartment,
  fetchDepartments,
  type ListDepartmentsParams,
  updateDepartment,
} from "@/modules/departments/api/client";
export { departmentEndpoints } from "@/modules/departments/api/endpoints";
export { DEFAULT_PAGE_SIZE } from "@/modules/departments/constants";
export type {
  Department,
  DepartmentList,
  PageInfo,
} from "@/modules/departments/models/department";
export {
  departmentKeys,
  departmentListQuery,
} from "@/modules/departments/queries/department.queries";
