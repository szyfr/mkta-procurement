import type { Metadata } from "next";

import { PurchaseRequestCanvassingView } from "@/components/canvassing/pr-canvassing-view";

/**
 * The request is fetched in the browser, so the title can't reflect it — same
 * reason the detail page carries a static one.
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

  return <PurchaseRequestCanvassingView id={id} />;
}
