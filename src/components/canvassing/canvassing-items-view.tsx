"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageXIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/query-states";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  purchaseRequestDetailQuery,
  purchaseRequestItemStatusLabels,
  purchaseRequestItemTone,
} from "@/modules/purchase-requests";

/**
 * The live part of the canvassing screen: the request's own header and the
 * items available for quotation, read from the purchase request detail the BFF
 * already serves. The batch comparison below it stays static — no canvassing
 * endpoint exists yet.
 *
 * There is no Batch column: no batch or grouping field exists on the item
 * model, its DTO, or the backend, so there is nothing to render. It returns
 * once items can actually be grouped.
 */
export function CanvassingItemsView({ id }: { id: string }) {
  const {
    data: request,
    isPending,
    isError,
    error,
  } = useQuery(purchaseRequestDetailQuery(id));

  /**
   * Selection is local and inert. Nothing accepts a batch yet, so checking a
   * row only drives the footer count and unlocks the link to the quote form.
   */
  const [selected, setSelected] = React.useState<string[]>([]);

  function toggle(itemId: string, checked: boolean) {
    setSelected((current) =>
      checked
        ? [...current, itemId]
        : current.filter((entry) => entry !== itemId),
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Canvassing" />
        <ErrorAlert title="Couldn't load this purchase request" error={error} />
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </>
    );
  }

  const itemCount = request.items.length;

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            Canvassing —
            <span className="font-mono text-base">{request.no}</span>
          </span>
        }
        description={`${request.department} · ${itemCount} ${
          itemCount === 1 ? "item" : "items"
        } · not all items need to go to the same vendor`}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
          <CardTitle>Items in this Purchase Request</CardTitle>
          <span className="text-xs text-muted-foreground">
            Select items to send out for quotation together
          </span>
        </CardHeader>

        {itemCount === 0 ? (
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PackageXIcon />
                </EmptyMedia>
                <EmptyTitle>No items to canvass</EmptyTitle>
                <EmptyDescription>
                  This purchase request has no items available for quotation.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        ) : (
          <>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="w-8 pl-4">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead scope="col">Item</TableHead>
                    <TableHead scope="col">Qty</TableHead>
                    <TableHead scope="col" className="pr-4">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.items.map((item) => {
                    const isSelected = selected.includes(item.id);

                    return (
                      <TableRow
                        key={item.id}
                        className={cn(isSelected && "bg-status-info/5")}
                      >
                        <TableCell className="pl-4">
                          <Checkbox
                            checked={isSelected}
                            aria-label={`Select ${item.name}`}
                            onCheckedChange={(checked) =>
                              toggle(item.id, checked === true)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="pr-4">
                          <StatusBadge
                            tone={purchaseRequestItemTone[item.status]}
                          >
                            {purchaseRequestItemStatusLabels[item.status]}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>

            <CardFooter className="justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {selected.length} {selected.length === 1 ? "item" : "items"}{" "}
                selected
                {selected.length > 0
                  ? " — not yet grouped into an active batch"
                  : ""}
              </span>
              <Button
                size="sm"
                disabled={selected.length === 0}
                render={<Link href={`/canvassing/${request.id}/quotes/new`} />}
                nativeButton={false}
              >
                Create Quotation for Selected Items →
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </>
  );
}
