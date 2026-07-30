import { departmentEndpoints } from "@/modules/departments/api/endpoints";
import type {
  Department,
  DepartmentList,
} from "@/modules/departments/models/department";

/**
 * Frontend API Client — runs in the browser and calls the BFF only.
 *
 * It knows nothing about FastAPI: no upstream URLs, no snake_case DTOs. Route
 * Handlers return models already, so responses pass straight through.
 */

/** What a failed BFF call surfaces to a component. Already user-safe. */
export class DepartmentApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "DepartmentApiError";
    this.status = status;
  }
}

type QueryValue = string | number | undefined | null;

function withQuery(path: string, query?: Record<string, QueryValue>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }

  const search = params.toString();

  return search ? `${path}?${search}` : path;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, query, signal } = options;

  const response = await fetch(withQuery(path, query), {
    method,
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? ((payload as { error?: { message?: string } }).error?.message ??
          "Something went wrong.")
        : "Something went wrong.";

    throw new DepartmentApiError(response.status, message);
  }

  return (payload as { data: T }).data;
}

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
  return request<DepartmentList>(departmentEndpoints.list, {
    query: { page, pageSize },
    signal,
  });
}

export function fetchDepartment(id: string, signal?: AbortSignal) {
  return request<Department>(departmentEndpoints.detail(id), { signal });
}

export interface DepartmentPayload {
  title: string;
  description: string;
}

export function createDepartment(payload: DepartmentPayload) {
  return request<Department>(departmentEndpoints.create, {
    method: "POST",
    body: payload,
  });
}

export function updateDepartment(id: string, payload: DepartmentPayload) {
  return request<Department>(departmentEndpoints.detail(id), {
    method: "PUT",
    body: payload,
  });
}

export function deleteDepartment(id: string) {
  return request<null>(departmentEndpoints.detail(id), { method: "DELETE" });
}
