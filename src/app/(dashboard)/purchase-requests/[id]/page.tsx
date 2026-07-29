import type { Metadata } from "next";

import { PurchaseRequestDetailView } from "@/components/purchase-requests/pr-detail-view";

/**
 * The request is fetched in the browser, so the title can't reflect it — the
 * set of requests is also unbounded, which is why there's no
 * `generateStaticParams` here any more.
 */
export const metadata: Metadata = {
  title: "Purchase Request",
};

export default async function PurchaseRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <PurchaseRequestDetailView id={id} />;
}
