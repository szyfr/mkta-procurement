import type { NextRequest } from "next/server";

import { toErrorResponse } from "@/lib/api/errors";
import { readPageParam } from "@/lib/api/pagination";
import { LOOKUP_PAGE_SIZE } from "@/lib/lookup";
import { listPaymentTermOptions } from "@/modules/payment-terms/dal/payment-term.dal";

/**
 * Payment terms for the quotation form's picker. `POST /quotations` requires a
 * `payment_term_id`, and this is the only place the browser can resolve one.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const result = await listPaymentTermOptions({
      page: readPageParam(searchParams.get("page"), 1),
      pageSize: readPageParam(searchParams.get("pageSize"), LOOKUP_PAGE_SIZE),
      search: searchParams.get("search"),
    });

    return Response.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
