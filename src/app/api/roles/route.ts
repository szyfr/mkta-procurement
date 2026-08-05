import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { readPageParam } from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/roles/constants";
import { listRoles } from "@/modules/roles/dal/role.dal";

/** BFF for the role collection. Create is not wired — FastAPI has no write endpoint yet. */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const result = await listRoles({
      page: readPageParam(searchParams.get("page"), 1),
      pageSize: readPageParam(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
      search: searchParams.get("search"),
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
