"use client";

import { SearchXIcon } from "lucide-react";

import { PurchaseRequestCard } from "@/components/purchase-requests/pr-card";
import { PurchaseRequestTable } from "@/components/purchase-requests/pr-table";
import type { ListView } from "@/components/purchase-requests/view-toggle";
import { DataToolbar } from "@/components/shared/data-toolbar";
import {
    CardsSkeleton,
    DataError,
    TableSkeleton,
} from "@/components/shared/query-state";
import { StatusLegend } from "@/components/shared/status-legend";
import { Card, CardContent } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { usePurchaseRequests } from "@/hooks/purchase-requests";
import { useDepartments } from "@/hooks/reference";

export function PurchaseRequestsView({ view }: { view: ListView }) {
    const { data: departments = [] } = useDepartments();
    const { data, isPending, isError, error, refetch } = usePurchaseRequests();

    const filters = [
        {
            label: "Status",
            options: [
                "Draft",
                "Canvassing",
                "PO Created",
                "Partially Completed",
                "Completed",
                "Rejected",
            ],
        },
        { label: "Priority", options: ["High", "Normal", "Low"] },
        { label: "Department", options: departments },
        {
            label: "Date",
            options: ["Last 7 days", "Last 30 days", "Last 90 days"],
        },
    ];

    return (
        <>
            <DataToolbar placeholder="Filter requests…" filters={filters} />

            <StatusLegend />

            {isError ? (
                <DataError error={error} onRetry={() => refetch()} />
            ) : isPending ? (
                view === "table" ? (
                    <Card>
                        <CardContent className="px-0">
                            <TableSkeleton rows={6} columns={9} />
                        </CardContent>
                    </Card>
                ) : (
                    <CardsSkeleton />
                )
            ) : data.items.length === 0 ? (
                <Card>
                    <CardContent>
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <SearchXIcon />
                                </EmptyMedia>
                                <EmptyTitle>
                                    No purchase requests found
                                </EmptyTitle>
                                <EmptyDescription>
                                    Nothing matches the current filters. Try
                                    adjusting or clearing them.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </CardContent>
                </Card>
            ) : view === "table" ? (
                <PurchaseRequestTable
                    requests={data.items}
                    total={data.total}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {data.items.map((request) => (
                        <PurchaseRequestCard
                            key={request.id}
                            request={request}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
