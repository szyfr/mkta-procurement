import type { Metadata } from "next";

import { CanvassingItemsView } from "@/components/canvassing/canvassing-items-view";
import { CanvassingQuotationsView } from "@/components/canvassing/canvassing-quotations-view";

export const metadata: Metadata = {
  title: "Canvassing",
};

/**
 * Canvassing for one purchase request: its items, and the vendor quotes
 * competing for each item routed to canvassing.
 *
 * Both halves read the backend. What is still missing is the write side —
 * entering a quote and awarding one — so the actions those views render stay
 * disabled rather than being wired to endpoints that can't support them.
 */
export default async function CanvassingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <CanvassingItemsView id={id} />
      <CanvassingQuotationsView id={id} />
    </>
  );
}
