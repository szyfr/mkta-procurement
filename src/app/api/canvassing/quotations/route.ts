import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { listItemQuotations } from "@/modules/canvassing/dal/quotation.dal";

/**
 * BFF for the quotes covering a set of purchase request items.
 *
 * `items` is repeated once per id (`?items=a&items=b`), matching the upstream
 * `list[str]` parameter — a comma-joined value is rejected by FastAPI.
 */

export async function GET(request: NextRequest) {
  try {
    const items = request.nextUrl.searchParams.getAll("items");

    return Response.json({ data: await listItemQuotations(items) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
