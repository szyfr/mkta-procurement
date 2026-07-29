"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";

import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { purchaseRequestTone } from "@/lib/status-tones";
import type { PurchaseRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PurchaseRequestTable({
    requests,
    /** Row count across all pages, from the list endpoint's `meta.total`. */
    total,
}: {
    requests: PurchaseRequest[];
    total?: number;
}) {
    const router = useRouter();

    return (
        <Card>
            <CardContent className="px-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead scope="col" className="pl-4">
                                PR No.
                            </TableHead>
                            <TableHead scope="col">Title</TableHead>
                            <TableHead scope="col">Requester</TableHead>
                            <TableHead scope="col">Department</TableHead>
                            <TableHead scope="col">Amount</TableHead>
                            <TableHead scope="col">Priority</TableHead>
                            <TableHead scope="col">Status</TableHead>
                            <TableHead scope="col">Created</TableHead>
                            <TableHead scope="col" className="pr-4">
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => {
                            const href =
                                request.status === "draft"
                                    ? "/purchase-requests/new"
                                    : `/purchase-requests/${request.id}`;
                            const needsProof =
                                request.status === "po-created" ||
                                request.status === "partially-completed";

                            const stopRowNavigation = (
                                event: MouseEvent<HTMLAnchorElement>,
                            ) => {
                                event.stopPropagation();
                            };

                            const handleRowKeyDown = (
                                event: KeyboardEvent<HTMLTableRowElement>,
                            ) => {
                                if (event.key !== "Enter") return;
                                if (event.target !== event.currentTarget) {
                                    return;
                                }
                                router.push(href);
                            };

                            return (
                                // biome-ignore lint/a11y/useSemanticElements: an <a> can't wrap a <tr>; this is a table row acting as a navigation target.
                                <TableRow
                                    key={request.id}
                                    tabIndex={0}
                                    role="link"
                                    aria-label={`Open ${request.id}`}
                                    onClick={() => router.push(href)}
                                    onKeyDown={handleRowKeyDown}
                                    className="cursor-pointer"
                                >
                                    <TableCell className="pl-4 font-medium">
                                        {request.id}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {request.title ?? (
                                            <span className="italic">
                                                Untitled
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{request.requester}</TableCell>
                                    <TableCell>{request.department}</TableCell>
                                    <TableCell>
                                        {formatCurrency(request.amount)}
                                    </TableCell>
                                    <TableCell>
                                        <PriorityBadge
                                            priority={request.priority}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge
                                            tone={
                                                purchaseRequestTone[
                                                    request.status
                                                ]
                                            }
                                        >
                                            {request.statusLabel}
                                        </StatusBadge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {request.createdAt ?? "Not submitted"}
                                    </TableCell>
                                    <TableCell className="pr-4">
                                        <div className="flex flex-col items-start gap-1 text-xs">
                                            <Link
                                                href={href}
                                                onClick={stopRowNavigation}
                                                className="hover:underline"
                                            >
                                                Open →
                                            </Link>
                                            {needsProof ? (
                                                <Link
                                                    href={`/purchase-requests/${request.id}`}
                                                    onClick={stopRowNavigation}
                                                    className="text-status-ordered hover:underline"
                                                >
                                                    + Add Proof of Order
                                                </Link>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
                <span>
                    Showing {requests.length} of {total ?? requests.length}
                </span>
                <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="?page=1" />
                        </PaginationItem>
                        {[1, 2, 3].map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    href={`?page=${page}`}
                                    isActive={page === 1}
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext href="?page=2" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardFooter>
        </Card>
    );
}
