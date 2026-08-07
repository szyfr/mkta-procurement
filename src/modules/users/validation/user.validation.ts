import { ApiError } from "@/lib/api/errors";
import type { UpdateUserRolesDto } from "@/modules/users/dto/update-user-roles.dto";

/**
 * Request-body validation for `PATCH /api/users/{id}/roles`, so a bad payload
 * can be reported as a proper 422 instead of round-tripping to FastAPI first.
 */
export function parseUpdateUserRolesPayload(body: unknown): UpdateUserRolesDto {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<UpdateUserRolesDto>;

  const roleIds = payload.role_ids;
  if (
    !Array.isArray(roleIds) ||
    !roleIds.every((id) => typeof id === "string")
  ) {
    throw invalid("Role ids are required.");
  }

  return { role_ids: roleIds };
}
