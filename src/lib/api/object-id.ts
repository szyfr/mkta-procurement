import { ApiError } from "@/lib/api/errors";

/** Anything that isn't a 24-character hex string can't be a Mongo `_id`. */
export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * For ids that arrive as a path segment: a malformed one is a 404 from our
 * side rather than a round trip to FastAPI. Ids that arrive in a request body
 * are a validation failure instead — check those with `isObjectId` and throw a
 * 422, so the message names the field that was wrong.
 */
export function assertObjectId(id: string, notFoundMessage: string) {
  if (!isObjectId(id)) {
    throw new ApiError(404, "not_found", notFoundMessage);
  }
}
