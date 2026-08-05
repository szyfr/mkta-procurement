import { ApiError } from "@/lib/api/errors";
import type { CreateDepartmentDto } from "@/modules/departments/dto";

/**
 * Request-body validation for the department BFF routes, which both accept the
 * same payload. FastAPI is lenient about it, so the check happens here where a
 * failure can be reported as a proper 422.
 */
export function parseDepartmentPayload(body: unknown): CreateDepartmentDto {
  const invalid = (message: string) =>
    new ApiError(422, "validation_failed", message);

  if (!body || typeof body !== "object")
    throw invalid("Request body is missing.");

  const payload = body as Partial<CreateDepartmentDto>;

  const title = payload.title?.trim();
  if (!title) throw invalid("Title is required.");

  return { title, description: payload.description?.trim() ?? "" };
}
