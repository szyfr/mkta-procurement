import { ApiError } from "@/lib/api/errors";
import { isObjectId } from "@/lib/api/object-id";

/**
 * Request-body parsing for the award Route Handler.
 *
 * Upstream loops the ids straight into a `get_by_id` and then into a Pydantic
 * model, so a non-ObjectId escapes as a 400 with no field named and an empty
 * list awards nothing while still answering 200. Both are caught here instead.
 *
 * `validation_failed` is the one code whose message `toPublicMessage` passes
 * through, so these strings are what the user actually reads.
 */

function invalid(message: string) {
  return new ApiError(422, "validation_failed", message);
}

export function parseAwardItems(body: unknown): string[] {
  const items = (body as { items?: unknown } | null)?.items;

  if (!Array.isArray(items) || items.length === 0) {
    throw invalid("Select at least one item to award.");
  }

  return items.map((item, index) => {
    if (!isObjectId(item)) {
      throw invalid(`Item ${index + 1} is not a valid purchase request item.`);
    }

    return item;
  });
}
