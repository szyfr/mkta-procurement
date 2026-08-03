import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { awardQuotation } from "@/modules/canvassing/dal/canvassing.dal";
import { parseAwardItems } from "@/modules/canvassing/validation/award.validation";

/**
 * BFF for awarding a quotation. Mirrors FastAPI's
 * `PATCH /canvassing/award/{quotation_id}`, whose body is the list of purchase
 * request items the quote wins.
 *
 * The upstream answers 200 with the inserted award documents; they carry no
 * joins, so the browser refetches the comparison rather than reading them.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/canvassing/award/[quotationId]">,
) {
  try {
    const { quotationId } = await context.params;
    const items = parseAwardItems(await request.json().catch(() => null));

    return Response.json({ data: await awardQuotation(quotationId, items) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
