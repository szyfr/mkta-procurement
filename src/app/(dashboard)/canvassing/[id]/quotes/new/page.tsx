import type { Metadata } from "next";

import { AddQuoteView } from "@/components/canvassing/add-quote-view";

export const metadata: Metadata = {
  title: "Add Vendor Quote",
};

export default async function AddVendorQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ batch?: string }>;
}) {
  const [{ id }, { batch }] = await Promise.all([params, searchParams]);

  return (
    <AddQuoteView purchaseRequestId={id} batchNumber={Number(batch) || 1} />
  );
}
