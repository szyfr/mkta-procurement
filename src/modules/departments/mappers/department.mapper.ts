import type {
  DepartmentDto,
  PaginationDto,
} from "@/modules/departments/dto/department.dto";
import type {
  Department,
  PageInfo,
} from "@/modules/departments/models/department";
import { formatDate } from "@/modules/departments/utils";

/** DTO → model. Keeps the transformation logic out of the DAL and components. */

export function toDepartment(dto: DepartmentDto): Department {
  return {
    id: dto._id,
    title: dto.title,
    description: dto.description ?? "",
    createdAt: formatDate(dto.created_at),
    updatedAt: formatDate(dto.updated_at),
  };
}

export function toPageInfo(pagination: PaginationDto): PageInfo {
  return {
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
    currentPage: pagination.current_page,
    pageSize: pagination.page_size,
    nextPage: pagination.next_page,
    prevPage: pagination.prev_page,
  };
}
