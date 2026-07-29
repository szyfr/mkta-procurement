import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { LOOKUP_PAGE_SIZE } from "@/modules/purchase-requests/constants";
import { listMaterials } from "@/modules/purchase-requests/dal/lookup.dal";

/**
 * Material catalog for the create form's item picker.
 *
 * There are ~1,900 materials, so the picker pages through them and narrows with
 * `search` rather than loading the whole catalog into a select.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get("page"));
    const pageSize = Number(searchParams.get("pageSize"));

    const result = await listMaterials({
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
