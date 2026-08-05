import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { getQuotation } from "@/modules/canvassing/dal/quotation.dal";

/**
 * BFF for a single quotation. Mirrors FastAPI's `GET /quotations/{id}`, the
 * only read that carries attachments — the list endpoints join neither.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/canvassing/quotations/[id]">,
) {
  try {
    const { id } = await context.params;

    return Response.json({ data: await getQuotation(id) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
