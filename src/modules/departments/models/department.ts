import type { PageInfo } from "@/lib/api/pagination";

/** Domain object used throughout the Departments UI. */
export interface Department {
  id: string;
  title: string;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DepartmentList {
  departments: Department[];
  page: PageInfo;
}

/**
 * What the UI submits to create or update a department. The BFF validates this
 * shape before it becomes a DTO, so it is shared by the API client and the
 * Route Handlers rather than owned by either.
 */
export interface DepartmentPayload {
  title: string;
  description: string;
}
