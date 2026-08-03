import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import {
  clampPageSize,
  MAX_PAGE_SIZE,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/departments/constants";
import type {
  CreateDepartmentDto,
  DepartmentDto,
  UpdateDepartmentDto,
} from "@/modules/departments/dto";
import { toDepartment } from "@/modules/departments/mappers/department.mapper";
import type {
  Department,
  DepartmentList,
} from "@/modules/departments/models/department";

/**
 * Department reads and writes against FastAPI. Server-side only, called from
 * Route Handlers — never from a component.
 */

const NOT_FOUND = "Department not found";

export interface ListDepartmentsQuery {
  page?: number;
  pageSize?: number;
}

export async function listDepartments(
  query: ListDepartmentsQuery = {},
): Promise<DepartmentList> {
  const response = await serverFetch<PaginatedDto<DepartmentDto>>(
    "/departments",
    {
      query: {
        page: query.page ?? 1,
        page_size: clampPageSize(query.pageSize, DEFAULT_PAGE_SIZE),
      },
    },
  );

  return {
    departments: response.data.map(toDepartment),
    page: toPageInfo(response.pagination),
  };
}

/**
 * FastAPI offers no by-id read for departments, only a paginated list. The
 * collection is small, so a single record is resolved by walking every page and
 * matching the id.
 */
export async function getDepartment(id: string): Promise<Department> {
  assertObjectId(id, NOT_FOUND);

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
    throw new ApiError(404, "not_found", NOT_FOUND);
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
  assertObjectId(id, NOT_FOUND);

  const dto = await serverFetch<DepartmentDto>(`/departments/${id}`, {
    method: "PUT",
    body: input,
  });

  return toDepartment(dto);
}

export async function deleteDepartment(id: string): Promise<void> {
  assertObjectId(id, NOT_FOUND);

  await serverFetch<null>(`/departments/${id}`, { method: "DELETE" });
}
