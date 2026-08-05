import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { getRole } from "@/modules/roles/dal/role.dal";

/** BFF for a single role. Edit and delete are not wired — no write endpoint exists yet. */

export async function GET(
  _request: NextRequest,
  context: RouteContext<"/api/roles/[id]">,
) {
  try {
    const { id } = await context.params;

    return Response.json({ data: await getRole(id) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
