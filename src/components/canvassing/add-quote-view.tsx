"use client";

import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";

import { QuoteForm } from "@/components/canvassing/quote-form";
import { PageHeader } from "@/components/shared/page-header";
import { DataError, PanelSkeleton } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { useCanvassingDetail } from "@/hooks/canvassing";
import { formatCurrency } from "@/lib/utils";

export function AddQuoteView({
    purchaseRequestId,
    batchNumber,
}: {
    purchaseRequestId: string;
    batchNumber: number;
}) {
    const {
        data: detail,
        isPending,
        isError,
        error,
        refetch,
    } = useCanvassingDetail(purchaseRequestId);

    if (isPending) {
        return (
            <>
                <PageHeader title="Add Vendor Quote" description="Loading…" />
                <Card>
                    <CardContent className="px-0">
                        <PanelSkeleton lines={5} />
                    </CardContent>
                </Card>
            </>
        );
    }

    if (isError) {
        return <DataError error={error} onRetry={() => refetch()} />;
    }

    const batch = detail.batches.find(
        (candidate) => candidate.batch === batchNumber,
    );

    if (!batch) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FileQuestionIcon />
                    </EmptyMedia>
                    <EmptyTitle>Batch {batchNumber} does not exist</EmptyTitle>
                    <EmptyDescription>
                        {purchaseRequestId} has no batch {batchNumber}. Create
                        one from the canvassing page before adding quotes.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button
                        variant="outline"
                        render={
                            <Link href={`/canvassing/${purchaseRequestId}`} />
                        }
                        nativeButton={false}
                    >
                        Back to Canvassing
                    </Button>
                </EmptyContent>
            </Empty>
        );
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
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
                    <QuoteForm
                        purchaseRequestId={detail.purchaseRequestId}
                        batch={batch}
                    />
                </div>

                <div className="flex min-w-0 flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xs">
                                This Batch So Far
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between gap-2 py-1">
                                <span className="text-muted-foreground">
                                    Quotes received
                                </span>
                                <span>
                                    {batch.quotesReceived} of{" "}
                                    {batch.quotesRequired} minimum
                                </span>
                            </div>
                            {lowest ? (
                                <div className="flex items-center justify-between gap-2 py-1">
                                    <span className="text-muted-foreground">
                                        Lowest so far
                                    </span>
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
                            Saving this quote adds it as another row in the
                            Batch {batch.batch} comparison table — it does not
                            select a winner. Vendor selection happens separately
                            once all quotes are in.
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
