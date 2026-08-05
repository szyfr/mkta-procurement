import { ApiError } from "@/lib/api/errors";
import type { CreateRoleDto, UpdateRoleDto } from "@/modules/roles/dto";

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

/**
 * `PUT /roles/{id}` payload validation. `title` is optional here — the
 * endpoint's own sample body omits it — but `description` and
 * `permission_ids` are still required.
 */
export function parseUpdateRolePayload(body: unknown): UpdateRoleDto {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<UpdateRoleDto>;

  const permissionIds = payload.permission_ids;
  if (
    !Array.isArray(permissionIds) ||
    !permissionIds.every((id) => typeof id === "string")
  ) {
    throw invalid("Permission ids are required.");
  }

  const title = payload.title?.trim();

  return {
    ...(title ? { title } : {}),
    description: payload.description?.trim() ?? "",
    permission_ids: permissionIds,
  };
}
