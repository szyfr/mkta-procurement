import { ApiError } from "@/lib/api/errors";
import type { CreateRoleDto } from "@/modules/roles/dto";

/**
 * Request-body validation for `POST /api/roles`, so a bad payload can be
 * reported as a proper 422 instead of round-tripping to FastAPI first.
 */
export function parseCreateRolePayload(body: unknown): CreateRoleDto {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<CreateRoleDto>;

  const title = payload.title?.trim();
  if (!title) throw invalid("Title is required.");

  const permissionIds = payload.permission_ids;
  if (
    !Array.isArray(permissionIds) ||
    !permissionIds.every((id) => typeof id === "string")
  ) {
    throw invalid("Permission ids are required.");
  }

  return {
    title,
    description: payload.description?.trim() ?? "",
    permission_ids: permissionIds,
  };
}
