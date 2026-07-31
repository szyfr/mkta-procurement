/**
 * Response/request contracts, mirroring FastAPI exactly — snake_case, `_id`
 * keys. These never reach React components; the mapper converts them to
 * models first. The pagination envelope they arrive in is shared — see
 * `lib/api/pagination`.
 */

export interface DepartmentDto {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentDto {
  title: string;
  description: string;
}

/** `PUT /departments/{id}` accepts a full replacement, same shape as create. */
export type UpdateDepartmentDto = CreateDepartmentDto;
