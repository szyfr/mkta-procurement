import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { readPageParam } from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/canvassing/constants";
import { listCanvassing } from "@/modules/canvassing/dal/canvassing.dal";

/**
 * BFF for the canvassing collection. The browser reaches FastAPI only through
 * here, and never learns its address.
 *
 * Read-only for now — quotations, vendor selection and the canvassing detail
 * are not wired up yet.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const result = await listCanvassing({
      page: readPageParam(searchParams.get("page"), 1),
      pageSize: readPageParam(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
