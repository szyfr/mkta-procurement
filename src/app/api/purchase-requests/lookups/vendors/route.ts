import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { LOOKUP_PAGE_SIZE } from "@/modules/purchase-requests/constants";
import { listVendors } from "@/modules/purchase-requests/dal/lookup.dal";

/**
 * Vendors for the create form, used on directly-sourced lines where the
 * requester picks a vendor instead of routing the item to canvassing.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page"));
    const pageSize = Number(searchParams.get("pageSize"));

    const result = await listVendors({
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
      pageSize:
        Number.isFinite(pageSize) && pageSize > 0
          ? Math.floor(pageSize)
          : LOOKUP_PAGE_SIZE,
      search: searchParams.get("search"),
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
