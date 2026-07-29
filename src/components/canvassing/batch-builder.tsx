"use client";

import { PackageXIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { DataError } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCreateBatch } from "@/hooks/canvassing";
import type { CanvassingDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Groups items into a batch to send out for quotation together. Items already
 * assigned to a batch start unselected.
 */
export function BatchBuilder({
    purchaseRequestId,
    items,
}: {
    purchaseRequestId: string;
    items: CanvassingDetail["items"];
}) {
    const router = useRouter();
    const createBatch = useCreateBatch(purchaseRequestId);

    // Nothing is preselected: an unbatched item is not necessarily available to
    // canvass — it may already be on a purchase order — and guessing wrong here
    // would put a sourced item into a batch.
    const [selected, setSelected] = React.useState<string[]>([]);

    function toggle(id: string, checked: boolean) {
        setSelected((current) =>
            checked
                ? [...current, id]
                : current.filter((entry) => entry !== id),
        );
    }

    /**
     * The selection used to be discarded on navigation — the quote page read a
     * batch number out of the URL that nothing had created. It now creates the
     * batch first and navigates to the number the server assigned.
     */
    function createQuotation() {
        createBatch.mutate(
            { itemIds: selected },
            {
                onSuccess: ({ batch }) => {
                    setSelected([]);
                    router.push(
                        `/canvassing/${purchaseRequestId}/quotes/new?batch=${batch}`,
                    );
                },
            },
        );
    }

    if (items.length === 0) {
        return (
            <Card>
                <CardHeader className="border-b">
                    <CardTitle>Items in this Purchase Request</CardTitle>
                </CardHeader>
                <CardContent>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PackageXIcon />
                            </EmptyMedia>
                            <EmptyTitle>No items to canvass</EmptyTitle>
                            <EmptyDescription>
                                This purchase request has no items available for
                                quotation.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
                <CardTitle>Items in this Purchase Request</CardTitle>
                <span className="text-xs text-muted-foreground">
                    Select items to send out for quotation together
                </span>
            </CardHeader>

            <CardContent className="px-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead scope="col" className="w-8 pl-4">
                                <span className="sr-only">Select</span>
                            </TableHead>
                            <TableHead scope="col">Item</TableHead>
                            <TableHead scope="col">Qty</TableHead>
                            <TableHead scope="col">Batch</TableHead>
                            <TableHead scope="col" className="pr-4">
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => {
                            const isSelected = selected.includes(item.id);

                            return (
                                <TableRow
                                    key={item.id}
                                    className={cn(
                                        isSelected && "bg-status-info/5",
                                    )}
                                >
                                    <TableCell className="pl-4">
                                        <Checkbox
                                            checked={isSelected}
                                            aria-label={`Select ${item.name}`}
                                            onCheckedChange={(checked) =>
                                                toggle(
                                                    item.id,
                                                    checked === true,
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>
                                        {item.batch === null ? (
                                            <span className="text-xs text-muted-foreground">
                                                Not assigned
                                            </span>
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    item.batch > 1 &&
                                                        "border-status-ordered/30 bg-status-ordered/10 text-status-ordered",
                                                )}
                                            >
                                                Batch {item.batch}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="pr-4">
                                        <StatusBadge tone={item.statusTone}>
                                            {item.status}
                                        </StatusBadge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="flex-col items-stretch gap-3">
                {createBatch.isError ? (
                    <DataError
                        error={createBatch.error}
                        title="Could not create the batch"
                    />
                ) : null}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                        {selected.length}{" "}
                        {selected.length === 1 ? "item" : "items"} selected
                        {selected.length > 0
                            ? " — not yet grouped into an active batch"
                            : ""}
                    </span>
                    <Button
                        size="sm"
                        disabled={
                            selected.length === 0 || createBatch.isPending
                        }
                        onClick={createQuotation}
                    >
                        {createBatch.isPending ? (
                            <>
                                <Spinner data-icon="inline-start" />
                                Creating batch
                            </>
                        ) : (
                            "Create Quotation for Selected Items →"
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
