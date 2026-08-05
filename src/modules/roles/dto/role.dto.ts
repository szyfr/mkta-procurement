/**
 * Request contract for creating a role, mirroring FastAPI exactly.
 *
 * There is no response DTO: `POST /roles` answers with the role document
 * itself, and that shape is `Role` — see `models/role`.
 */
export interface CreateRoleDto {
  title: string;
  description: string;
  permission_ids: string[];
}
