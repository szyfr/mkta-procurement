import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/fetcher";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@/modules/departments/constants";
import type {
  CreateDepartmentDto,
  DepartmentDto,
  PaginatedDto,
  UpdateDepartmentDto,
} from "@/modules/departments/dto";
import {
  toDepartment,
  toPageInfo,
} from "@/modules/departments/mappers/department.mapper";
import type {
  Department,
  DepartmentList,
} from "@/modules/departments/models/department";

/**
 * Department reads and writes against FastAPI. Server-side only, called from
 * Route Handlers — never from a component.
 */

export interface ListDepartmentsQuery {
  page?: number;
  pageSize?: number;
}

/** Anything that isn't a 24-character hex string is a 404 from our side. */
function assertObjectId(id: string) {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(404, "not_found", "Department not found");
  }
}

export async function listDepartments(
  query: ListDepartmentsQuery = {},
): Promise<DepartmentList> {
  const pageSize = Math.min(
    Math.max(query.pageSize ?? DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );

  const response = await serverFetch<PaginatedDto<DepartmentDto>>(
    "/departments",
    { query: { page: query.page ?? 1, page_size: pageSize } },
  );

  return {
    departments: response.data.map(toDepartment),
    page: toPageInfo(response.pagination),
  };
}

/**
 * FastAPI offers no by-id read for departments, only a paginated list. The
 * collection is small, so the edit form resolves a single record by walking
 * every page and matching the id.
 */
export async function getDepartment(id: string): Promise<Department> {
  assertObjectId(id);

  const first = await serverFetch<PaginatedDto<DepartmentDto>>("/departments", {
    query: { page: 1, page_size: MAX_PAGE_SIZE },
  });

  const pages = await Promise.all(
    Array.from({ length: first.pagination.total_pages - 1 }, (_, index) =>
      serverFetch<PaginatedDto<DepartmentDto>>("/departments", {
        query: { page: index + 2, page_size: MAX_PAGE_SIZE },
      }),
    ),
  );

  const dto = [first, ...pages]
    .flatMap((page) => page.data)
    .find((department) => department._id === id);

  if (!dto) {
    throw new ApiError(404, "not_found", "Department not found");
  }

  return toDepartment(dto);
}

export async function createDepartment(
  input: CreateDepartmentDto,
): Promise<Department> {
  const dto = await serverFetch<DepartmentDto>("/departments", {
    method: "POST",
    body: input,
  });

  return toDepartment(dto);
}

export async function updateDepartment(
  id: string,
  input: UpdateDepartmentDto,
): Promise<Department> {
  assertObjectId(id);

  const dto = await serverFetch<DepartmentDto>(`/departments/${id}`, {
    method: "PUT",
    body: input,
  });

  return toDepartment(dto);
}

export async function deleteDepartment(id: string): Promise<void> {
  assertObjectId(id);

  await serverFetch<null>(`/departments/${id}`, { method: "DELETE" });
}
