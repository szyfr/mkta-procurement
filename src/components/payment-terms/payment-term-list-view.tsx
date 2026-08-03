"use client";

import { useQuery } from "@tanstack/react-query";
import { HandCoinsIcon } from "lucide-react";

import { PaymentTermTable } from "@/components/payment-terms/payment-term-table";
import { EmptyState, ErrorAlert } from "@/components/shared/query-states";
import { TableSkeleton } from "@/components/shared/table-skeleton";
import { buildPageHref } from "@/lib/page-href";
import {
  type PaymentTerm,
  paymentTermListQuery,
} from "@/modules/payment-terms";

/** Payment term list, fetched from the BFF in the browser via TanStack Query. */
export function PaymentTermListView({
  page,
  onEdit,
}: {
  page: number;
  onEdit: (paymentTerm: PaymentTerm) => void;
}) {
  // Create, edit and delete invalidate the payment term cache, so the list
  // refetches itself — no reload token has to be threaded down from the page.
  const { data, isPending, isError, error } = useQuery(
    paymentTermListQuery(page),
  );

  if (isError) {
    return <ErrorAlert title="Couldn't load payment terms" error={error} />;
  }

  if (isPending) {
    return <TableSkeleton />;
  }

  const { paymentTerms, page: pageInfo } = data;

  if (paymentTerms.length === 0) {
    return (
      <EmptyState
        icon={<HandCoinsIcon />}
        title="No payment terms yet"
        description="Create one to make it available when creating a quotation."
      />
    );
  }

  return (
    <PaymentTermTable
      paymentTerms={paymentTerms}
      page={pageInfo}
      buildPageHref={(next) => buildPageHref("/payment-terms", next)}
      onEdit={onEdit}
    />
  );
}
