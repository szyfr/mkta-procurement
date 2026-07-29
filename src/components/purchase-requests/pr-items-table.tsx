import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type {
    PurchaseRequest,
    PurchaseRequestItem,
    StatusTone,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const itemStatus: Record<
    PurchaseRequestItem["status"],
    { label: string; tone: StatusTone }
> = {
    pending: { label: "Pending", tone: "neutral" },
    canvassing: { label: "Canvassing", tone: "info" },
    "po-created": { label: "PO Created", tone: "ordered" },
    delivered: { label: "Delivered", tone: "success" },
    "awaiting-batch": { label: "Awaiting Batch Assignment", tone: "neutral" },
    rejected: { label: "Rejected", tone: "danger" },
};

/** Per-item sourcing status, with the follow-up action for each row. */
export function PurchaseRequestItemsTable({
    request,
}: {
    request: PurchaseRequest;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead scope="col" className="pl-4">
                        Item
                    </TableHead>
                    <TableHead scope="col">Qty</TableHead>
                    <TableHead scope="col">Vendor</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="pr-4">
                        <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {request.items.map((item) => {
                    const status = itemStatus[item.status];
                    const label =
                        item.status === "delivered" && item.deliveredOn
                            ? `${status.label} — ${item.deliveredOn}`
                            : item.status === "canvassing" && item.batch
                              ? `${status.label} — Batch ${item.batch}`
                              : status.label;

                    return (
                        <TableRow
                            key={item.id}
                            className={cn(
                                item.status === "delivered" &&
                                    "bg-status-success/5",
                            )}
                        >
                            <TableCell className="pl-4">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                                {item.vendor ?? (
                                    <span className="text-muted-foreground italic">
                                        Empty — in canvassing
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <StatusBadge tone={status.tone}>
                                    {label}
                                </StatusBadge>
                            </TableCell>
                            <TableCell className="pr-4">
                                {item.status === "po-created" ? (
                                    <Button variant="outline" size="sm">
                                        Add Proof of Order &amp; Confirm
                                        Delivery
                                    </Button>
                                ) : item.status === "delivered" ? (
                                    <span className="text-xs text-muted-foreground">
                                        Proof on file
                                    </span>
                                ) : item.status === "canvassing" ? (
                                    <Link
                                        href={`/canvassing/${request.id}`}
                                        className="text-xs text-muted-foreground hover:underline"
                                    >
                                        View Canvassing →
                                    </Link>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
