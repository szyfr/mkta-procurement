import type { NextRequest } from "next/server";

import { ApiError, toErrorResponse } from "@/lib/api/errors";
import { assertObjectId } from "@/lib/api/object-id";
import { listItemQuotations } from "@/modules/canvassing/dal/canvassing.dal";

/**
 * BFF for quotations against a set of purchase request items. The browser
 * reaches FastAPI only through here, and never learns its address.
 *
 * Read-only: `PATCH /canvassing/award/{quotation_id}` awards a quotation, but
 * awards have no read endpoint, so nothing would reflect the result.
 */

export async function GET(request: NextRequest) {
  try {
    // FastAPI takes the ids as a repeated parameter, so this is `getAll`, not
    // a comma-separated value to split.
    const itemIds = request.nextUrl.searchParams.getAll("items");

    if (itemIds.length === 0) {
      throw new ApiError(
        422,
        "validation_failed",
        "At least one item id is required.",
      );
    }

    for (const itemId of itemIds) {
      assertObjectId(itemId, "Purchase request item not found");
    }

    const result = await listItemQuotations(itemIds);

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
