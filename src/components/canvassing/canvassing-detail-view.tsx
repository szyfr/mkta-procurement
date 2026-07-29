"use client";

import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";

import { BatchBuilder } from "@/components/canvassing/batch-builder";
import { BatchComparison } from "@/components/canvassing/batch-comparison";
import { PageHeader } from "@/components/shared/page-header";
import { DataError, PanelSkeleton } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { useCanvassingDetail } from "@/hooks/canvassing";
import { isNotFound } from "@/hooks/purchase-requests";
import { formatCurrency } from "@/lib/utils";

export function CanvassingDetailView({ id }: { id: string }) {
    const {
        data: detail,
        isPending,
        isError,
        error,
        refetch,
    } = useCanvassingDetail(id);

    if (isPending) {
        return (
            <>
                <PageHeader
                    title={`Canvassing — ${id}`}
                    description="Loading…"
                />
                <Card>
                    <CardContent className="px-0">
                        <PanelSkeleton lines={4} />
                    </CardContent>
                </Card>
            </>
        );
    }

    if (isError && isNotFound(error)) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FileQuestionIcon />
                    </EmptyMedia>
                    <EmptyTitle>No canvassing for {id}</EmptyTitle>
                    <EmptyDescription>
                        This purchase request does not exist, or it has no items
                        out for quotation.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button
                        variant="outline"
                        render={<Link href="/canvassing" />}
                        nativeButton={false}
                    >
                        Back to Canvassing
                    </Button>
                </EmptyContent>
            </Empty>
        );
    }

    if (isError) {
        return <DataError error={error} onRetry={() => refetch()} />;
    }

    return (
        <>
            <PageHeader
                title={`Canvassing — ${detail.purchaseRequestId}`}
                description={`${detail.department} · ${detail.items.length} items · not all items need to go to the same vendor`}
            />

            <BatchBuilder
                purchaseRequestId={detail.purchaseRequestId}
                items={detail.items}
            />

            {detail.batches.map((batch) => {
                const winner = batch.selectedVendorId
                    ? batch.quotes.find(
                          (quote) => quote.id === batch.selectedVendorId,
                      )
                    : undefined;

                // A batch with a confirmed winner collapses to a summary — there is
                // nothing left to compare.
                if (winner) {
                    return (
                        <section
                            key={batch.batch}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex flex-col gap-0.5">
                                    <h2 className="font-medium">
                                        Batch {batch.batch} —{" "}
                                        {batch.items
                                            .map((item) => item.name)
                                            .join(", ")}
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Vendor already selected for this item
                                    </p>
                                </div>
                                <StatusBadge tone="success">
                                    Vendor Selected — {winner.vendor}
                                </StatusBadge>
                            </div>

                            <Card>
                                <CardContent className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <p className="text-muted-foreground">
                                            Winning Price
                                        </p>
                                        <p>
                                            {formatCurrency(winner.total, true)}{" "}
                                            · {winner.vendor}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Delivery Estimate
                                        </p>
                                        <p>{winner.deliveryEstimate}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Quotes Received
                                        </p>
                                        <p>
                                            {batch.quotesReceived} /{" "}
                                            {batch.quotesRequired} minimum
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">
                                            Selected On
                                        </p>
                                        <p>{batch.selectedOn}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    );
                }

                return (
                    <BatchComparison
                        key={batch.batch}
                        purchaseRequestId={detail.purchaseRequestId}
                        batch={batch}
                    />
                );
            })}
        </>
    );
}
