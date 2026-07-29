"use client";

import {
    CalendarCheckIcon,
    CircleCheckBigIcon,
    ClipboardListIcon,
} from "lucide-react";
import Link from "next/link";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { KpiCards, KpiCardsSkeleton } from "@/components/dashboard/kpi-cards";
import { PriorityBadge } from "@/components/shared/priority-badge";
import {
    DataError,
    PanelSkeleton,
    TableSkeleton,
} from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDashboard } from "@/hooks/dashboard";
import { formatCurrency } from "@/lib/utils";

export function DashboardView() {
    const { data, isPending, isError, error, refetch } = useDashboard();

    if (isError) {
        return <DataError error={error} onRetry={() => refetch()} />;
    }

    return (
        <>
            {isPending ? <KpiCardsSkeleton /> : <KpiCards kpis={data.kpis} />}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
                            <CardTitle>Requests Requiring Action</CardTitle>
                            <span className="text-xs text-muted-foreground">
                                {isPending
                                    ? "—"
                                    : `${data.actionableRequests.length} items`}
                            </span>
                        </CardHeader>
                        <CardContent className="px-0">
                            {isPending ? (
                                <TableSkeleton rows={6} columns={6} />
                            ) : data.actionableRequests.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <CircleCheckBigIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            Nothing needs your attention
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            All caught up — no purchase requests
                                            are waiting on you right now.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead scope="col">
                                                PR No.
                                            </TableHead>
                                            <TableHead scope="col">
                                                Requester
                                            </TableHead>
                                            <TableHead scope="col">
                                                Department
                                            </TableHead>
                                            <TableHead scope="col">
                                                Amount
                                            </TableHead>
                                            <TableHead scope="col">
                                                Step
                                            </TableHead>
                                            <TableHead scope="col">
                                                Priority
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.actionableRequests.map(
                                            (request) => (
                                                <TableRow key={request.id}>
                                                    <TableCell className="px-4 font-medium">
                                                        <Link
                                                            href={`/purchase-requests/${request.id}`}
                                                            className="hover:underline"
                                                        >
                                                            {request.id}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.requester}
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.department}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(
                                                            request.amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            tone={
                                                                request.stepTone
                                                            }
                                                        >
                                                            {request.step}
                                                        </StatusBadge>
                                                    </TableCell>
                                                    <TableCell className="px-4">
                                                        <PriorityBadge
                                                            priority={
                                                                request.priority
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            {isPending ? (
                                <PanelSkeleton />
                            ) : (
                                <ActivityFeed entries={data.recentActivity} />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex min-w-0 flex-col gap-6">
                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Pending Quotations</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            {isPending ? (
                                <PanelSkeleton />
                            ) : data.pendingQuotations.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <ClipboardListIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            No pending quotations
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Nothing is currently awaiting vendor
                                            quotes.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <ul className="divide-y">
                                    {data.pendingQuotations.map((quotation) => (
                                        <li
                                            key={quotation.id}
                                            className="flex flex-col gap-0.5 px-4 py-3"
                                        >
                                            <Link
                                                href={`/canvassing/${quotation.id}`}
                                                className="text-sm hover:underline"
                                            >
                                                {quotation.summary}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">
                                                {quotation.detail}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardTitle>Upcoming Deadlines</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0">
                            {isPending ? (
                                <PanelSkeleton />
                            ) : data.upcomingDeadlines.length === 0 ? (
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <CalendarCheckIcon />
                                        </EmptyMedia>
                                        <EmptyTitle>
                                            No upcoming deadlines
                                        </EmptyTitle>
                                        <EmptyDescription>
                                            Nothing is due soon.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : (
                                <ul className="divide-y">
                                    {data.upcomingDeadlines.map((deadline) => (
                                        <li
                                            key={deadline.id}
                                            className="flex items-center justify-between gap-2 px-4 py-3"
                                        >
                                            <span className="text-sm">
                                                {deadline.label}
                                            </span>
                                            {deadline.overdue ? (
                                                <StatusBadge tone="danger">
                                                    {deadline.due}
                                                </StatusBadge>
                                            ) : (
                                                <Badge variant="outline">
                                                    {deadline.due}
                                                </Badge>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
