import { formatDate } from "@/lib/date";
import type { DepartmentDto } from "@/modules/departments/dto/department.dto";
import type { Department } from "@/modules/departments/models/department";

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
