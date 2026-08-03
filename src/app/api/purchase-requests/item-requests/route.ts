import { ApiError, toErrorResponse } from "@/lib/api/errors";

/**
 * Item Creation Requests have no backend at all — there is no controller,
 * model, or collection for them in FastAPI.
 *
 * The route exists so the contract is explicit and the UI has something real to
 * fail against, rather than being wired to invented data. Replace the throw
 * with a DAL call once the backend ships the endpoint.
 */
export function GET() {
  return toErrorResponse(
    new ApiError(
      501,
      "not_implemented",
      "Item creation requests are not available yet.",
    ),
  );
}
