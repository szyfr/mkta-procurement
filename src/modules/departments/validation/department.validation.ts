import { parseTitleDescriptionPayload } from "@/lib/api/validation";
import type { CreateDepartmentDto } from "@/modules/departments/dto";

/**
 * Request-body validation for the department BFF routes, which both accept the
 * same payload.
 */
export function parseDepartmentPayload(body: unknown): CreateDepartmentDto {
  return parseTitleDescriptionPayload<CreateDepartmentDto>(body);
}
