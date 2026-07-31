import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { DEFAULT_PAGE_SIZE } from "@/modules/vendors/constants";
import { listVendors } from "@/modules/vendors/dal/vendor.dal";

/**
 * BFF for the vendor collection. The browser reaches FastAPI only through
 * here, and never learns its address.
 *
 * Read-only for now — vendors are synced upstream and FastAPI exposes no
 * write endpoints for them yet.
 */

function readPageParam(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const result = await listVendors({
      page: readPageParam(searchParams.get("page"), 1),
      pageSize: readPageParam(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
