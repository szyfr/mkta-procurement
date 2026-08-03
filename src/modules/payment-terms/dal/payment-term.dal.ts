import { serverFetch } from "@/lib/api/fetcher";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { LOOKUP_PAGE_SIZE, type LookupPage } from "@/lib/lookup";
import type { PaymentTermDto } from "@/modules/payment-terms/dto";
import { toPaymentTermOption } from "@/modules/payment-terms/mappers/payment-term.mapper";

/**
 * Payment term reads against FastAPI. Server-side only, called from Route
 * Handlers — never from a component.
 *
 * Only the searchable list is wired up, because the one thing the UI needs a
 * payment term for is the quotation form's picker: `POST /quotations` requires
 * a `payment_term_id` and nothing else in the app resolves one. FastAPI also
 * exposes create, update, delete and a by-id read, none of which have a
 * screen behind them.
 */

export interface ListPaymentTermsQuery {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

export async function listPaymentTermOptions(
  query: ListPaymentTermsQuery = {},
): Promise<LookupPage> {
  const response = await serverFetch<PaginatedDto<PaymentTermDto>>(
    "/payment-terms",
    {
      query: {
        page: query.page ?? 1,
        // The backend defaults to 10 per page, which would page a dropdown
        // that rarely runs past a dozen rows.
        page_size: clampPageSize(query.pageSize, LOOKUP_PAGE_SIZE),
        search: query.search || undefined,
      },
    },
  );

  return {
    options: response.data.map(toPaymentTermOption),
    page: toPageInfo(response.pagination),
  };
}
