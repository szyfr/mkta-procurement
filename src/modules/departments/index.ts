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
  deleteDepartment,
  updateDepartment,
} from "@/modules/departments/api/client";
export type {
  Department,
  DepartmentPayload,
} from "@/modules/departments/models/department";
export {
  departmentKeys,
  departmentListQuery,
} from "@/modules/departments/queries/department.queries";
