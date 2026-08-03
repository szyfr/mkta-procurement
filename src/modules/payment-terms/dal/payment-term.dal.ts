import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import {
  clampPageSize,
  type PaginatedDto,
  toPageInfo,
} from "@/lib/api/pagination";
import { DEFAULT_PAGE_SIZE } from "@/modules/payment-terms/constants";
import type {
  CreatePaymentTermDto,
  PaymentTermDto,
  UpdatePaymentTermDto,
} from "@/modules/payment-terms/dto";
import { toPaymentTerm } from "@/modules/payment-terms/mappers/payment-term.mapper";
import type {
  PaymentTerm,
  PaymentTermList,
} from "@/modules/payment-terms/models/payment-term";

/**
 * Payment term reads and writes against FastAPI. Server-side only, called
 * from Route Handlers — never from a component.
 */

const NOT_FOUND = "Payment term not found";

export interface ListPaymentTermsQuery {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

export async function listPaymentTerms(
  query: ListPaymentTermsQuery = {},
): Promise<PaymentTermList> {
  const response = await serverFetch<PaginatedDto<PaymentTermDto>>(
    "/payment-terms",
    {
      query: {
        page: query.page ?? 1,
        page_size: clampPageSize(query.pageSize, DEFAULT_PAGE_SIZE),
        search: query.search || undefined,
      },
    },
  );

  return {
    paymentTerms: response.data.map(toPaymentTerm),
    page: toPageInfo(response.pagination),
  };
}

export async function getPaymentTerm(id: string): Promise<PaymentTerm> {
  assertObjectId(id, NOT_FOUND);

  const dto = await serverFetch<PaymentTermDto>(`/payment-terms/${id}`);

  return toPaymentTerm(dto);
}

export async function createPaymentTerm(
  input: CreatePaymentTermDto,
): Promise<PaymentTerm> {
  const dto = await serverFetch<PaymentTermDto>("/payment-terms", {
    method: "POST",
    body: input,
  });

  return toPaymentTerm(dto);
}

export async function updatePaymentTerm(
  id: string,
  input: UpdatePaymentTermDto,
): Promise<PaymentTerm> {
  assertObjectId(id, NOT_FOUND);

  const dto = await serverFetch<PaymentTermDto>(`/payment-terms/${id}`, {
    method: "PUT",
    body: input,
  });

  return toPaymentTerm(dto);
}

export async function deletePaymentTerm(id: string): Promise<void> {
  assertObjectId(id, NOT_FOUND);

  await serverFetch<null>(`/payment-terms/${id}`, { method: "DELETE" });
}
