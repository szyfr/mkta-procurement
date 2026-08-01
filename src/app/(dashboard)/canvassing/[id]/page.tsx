import type { Metadata } from "next";

import { CanvassingDetailView } from "@/components/canvassing/canvassing-detail-view";

/**
 * The purchase request is fetched in the browser, so the title can't reflect
 * it — the set of requests is also unbounded, so there's no
 * `generateStaticParams` here.
 */
export const metadata: Metadata = {
  title: "Canvassing",
};

export default async function CanvassingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CanvassingDetailView purchaseRequestId={id} />;
}
