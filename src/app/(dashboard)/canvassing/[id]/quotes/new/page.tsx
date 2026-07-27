import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { QuoteForm } from "@/components/canvassing/quote-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canvassingDetails, getCanvassingDetail } from "@/data/canvassing";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Add Vendor Quote",
};

export function generateStaticParams() {
  return canvassingDetails.map((detail) => ({
    id: detail.purchaseRequestId,
  }));
}

export default async function AddVendorQuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ batch?: string }>;
}) {
  const [{ id }, { batch: batchParam }] = await Promise.all([
    params,
    searchParams,
  ]);

  const detail = getCanvassingDetail(id);
  const batchNumber = Number(batchParam) || 1;
  const batch = detail?.batches.find(
    (candidate) => candidate.batch === batchNumber,
  );

  if (!detail || !batch) {
    notFound();
  }

  const lowest = batch.quotes.length
    ? batch.quotes.reduce((cheapest, quote) =>
        quote.total < cheapest.total ? quote : cheapest,
      )
    : undefined;

  return (
    <>
      <PageHeader
        title="Add Vendor Quote"
        description={`Batch ${batch.batch} — ${batch.items
          .map((item) => item.name)
          .join(", ")} · ${detail.purchaseRequestId}`}
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href={`/canvassing/${detail.purchaseRequestId}`} />}
              nativeButton={false}
            >
              Cancel
            </Button>
            <Button
              render={<Link href={`/canvassing/${detail.purchaseRequestId}`} />}
              nativeButton={false}
            >
              Save Quote
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <QuoteForm batch={batch} />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs">This Batch So Far</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between gap-2 py-1">
                <span className="text-muted-foreground">Quotes received</span>
                <span>
                  {batch.quotes.length} of {batch.quotesRequired} minimum
                </span>
              </div>
              {lowest ? (
                <div className="flex items-center justify-between gap-2 py-1">
                  <span className="text-muted-foreground">Lowest so far</span>
                  <span>
                    {lowest.vendor.split(" ")[0]} —{" "}
                    {formatCurrency(lowest.total)}
                  </span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-xs text-muted-foreground">
              Saving this quote adds it as another row in the Batch{" "}
              {batch.batch} comparison table — it does not select a winner.
              Vendor selection happens separately once all quotes are in.
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
