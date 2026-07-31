import { ApiError } from "@/lib/api/errors";

/**
 * Anything that isn't a 24-character hex string can't be a Mongo `_id`, so it
 * is a 404 from our side rather than a round trip to FastAPI.
 */
export function assertObjectId(id: string, notFoundMessage: string) {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(404, "not_found", notFoundMessage);
  }
}
