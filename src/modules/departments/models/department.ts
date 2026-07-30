/** Domain object used throughout the Departments UI. */
export interface Department {
  id: string;
  title: string;
  description: string;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Page metadata, mapped from the backend's pagination envelope. */
export interface PageInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface DepartmentList {
  departments: Department[];
  page: PageInfo;
}
