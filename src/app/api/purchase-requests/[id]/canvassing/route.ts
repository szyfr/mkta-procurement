import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { getPurchaseRequestCanvassing } from "@/modules/canvassing/dal/canvassing.dal";

/**
 * BFF for a purchase request's canvassing items and their quotations.
 * Composes two upstream reads server-side — see `getPurchaseRequestCanvassing`.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/purchase-requests/[id]/canvassing">,
) {
  try {
    const { id } = await context.params;

    return Response.json({ data: await getPurchaseRequestCanvassing(id) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
