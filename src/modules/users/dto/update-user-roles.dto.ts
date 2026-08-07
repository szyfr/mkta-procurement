/**
 * Request contract for `PATCH /users/{id}/roles`, mirroring FastAPI exactly.
 *
 * The endpoint answers with a confirmation message rather than the updated
 * user — see `UpdateUserRolesResult` in `models/user`.
 */
export interface UpdateUserRolesDto {
  role_ids: string[];
}
