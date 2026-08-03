"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageXIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { ItemQuotationsSection } from "@/components/canvassing/item-quotations";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/query-states";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/table-skeleton";
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
  EmptyContent,
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
import { itemQuotationsQuery } from "@/modules/canvassing";
import {
  purchaseRequestDetailQuery,
  purchaseRequestItemStatusLabels,
  purchaseRequestItemTone,
} from "@/modules/purchase-requests";

/**
 * Canvassing for one purchase request: its items, and the vendor quotes
 * received against each.
 *
 * There is no canvassing endpoint keyed by request, so this is two dependent
 * reads — the request supplies the item ids, which
 * `GET /api/canvassing/quotations` then takes. Batches have no backend source
 * at all and are left off the page rather than mocked; selection is local
 * state that nothing is submitted from yet.
 */
export function PurchaseRequestCanvassingView({ id }: { id: string }) {
  const {
    data: request,
    isPending,
    isError,
    error,
  } = useQuery(purchaseRequestDetailQuery(id));

  // Every item, matching what the endpoint expects — a directly sourced item
  // simply comes back with no quotes rather than vanishing from the page.
  const itemIds = request?.items.map((item) => item.id) ?? [];

  const {
    data: quotations,
    isPending: quotationsPending,
    isError: quotationsFailed,
    error: quotationsError,
  } = useQuery(itemQuotationsQuery(itemIds));

  const [selected, setSelected] = React.useState<string[]>([]);

  function toggle(itemId: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, itemId] : current.filter((it) => it !== itemId),
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader
          title="Canvassing"
          actions={
            <Button
              variant="outline"
              render={<Link href={`/purchase-requests/${id}`} />}
              nativeButton={false}
            >
              Back to Purchase Request
            </Button>
          }
        />
        <ErrorAlert title="Couldn't load this purchase request" error={error} />
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <TableSkeleton rows={4} columns={4} />
      </>
    );
  }

  const itemCount = `${request.items.length} ${
    request.items.length === 1 ? "item" : "items"
  }`;

  return (
    <>
      <PageHeader
        title={`Canvassing — ${request.no}`}
        description={`${request.department} · ${itemCount} · not all items need to go to the same vendor`}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
          <CardTitle>Items in this Purchase Request</CardTitle>
          <span className="text-xs text-muted-foreground">
            Select items to send out for quotation together
          </span>
        </CardHeader>

        <CardContent className="px-0">
          {request.items.length === 0 ? (
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
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/purchase-requests/${id}/edit`} />}
                >
                  Add Items
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
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
                      <TableCell className="font-medium">{item.name}</TableCell>
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
          )}
        </CardContent>

        {/* The empty state carries its own action, so the selection footer
            would only add a dead count and a permanently disabled button. */}
        {request.items.length === 0 ? null : (
          <CardFooter className="justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {selected.length} {selected.length === 1 ? "item" : "items"}{" "}
              selected
            </span>
            <Button
              size="sm"
              disabled={selected.length === 0}
              render={<Link href={`/canvassing/${id}/quotes/new`} />}
              nativeButton={false}
            >
              Create Quotation for Selected Items →
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Nothing to quote against when the request has no items, and the query
          is disabled in that case — so it would otherwise sit pending. */}
      {request.items.length === 0 ? null : quotationsFailed ? (
        <ErrorAlert
          title="Couldn't load quotations for this request"
          error={quotationsError}
        />
      ) : quotationsPending ? (
        <TableSkeleton rows={3} columns={6} />
      ) : (
        quotations.map((group) => (
          <ItemQuotationsSection key={group.itemId} group={group} />
        ))
      )}
    </>
  );
}
