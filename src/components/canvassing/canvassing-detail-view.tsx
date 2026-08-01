"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ErrorAlert } from "@/components/shared/query-states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PurchaseRequestItem } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";
import {
  type CanvassingQuotation,
  type PurchaseRequestCanvassingItem,
  purchaseRequestCanvassingQuery,
} from "@/modules/canvassing";
import {
  purchaseRequestDetailQuery,
  purchaseRequestItemStatusLabels,
  purchaseRequestItemTone,
} from "@/modules/purchase-requests";

/**
 * Canvassing detail, fetched from the BFF in the browser via TanStack Query.
 *
 * The backend has no "batch" concept — canvassing is one record per PR line
 * item, each independently quotable — so this renders one card per item
 * rather than the batch groupings the wireframe imagined. Awarding a vendor
 * and submitting a new quote aren't wired (no mutation is exposed for
 * either yet), so quotations are comparison-only here.
 */

function itemStatusLabel(status: string) {
  return (
    purchaseRequestItemStatusLabels[
      status as keyof typeof purchaseRequestItemStatusLabels
    ] ?? status
  );
}

function itemStatusTone(status: string) {
  return (
    purchaseRequestItemTone[status as keyof typeof purchaseRequestItemTone] ??
    "neutral"
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function QuotationsTable({
  quotations,
}: {
  quotations: CanvassingQuotation[];
}) {
  if (quotations.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-muted-foreground">
        No quotations yet.
      </p>
    );
  }

  const lowestTotal = Math.min(
    ...quotations.map((quotation) => quotation.total),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="pl-4">
            Vendor
          </TableHead>
          <TableHead scope="col">Reference No.</TableHead>
          <TableHead scope="col">Quote Date</TableHead>
          <TableHead scope="col">Delivery Estimate</TableHead>
          <TableHead scope="col" className="pr-4">
            Total
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((quotation) => (
          <TableRow
            key={quotation.id}
            className={cn(
              quotation.total === lowestTotal && "bg-status-success/5",
            )}
          >
            <TableCell className="pl-4">{quotation.vendor}</TableCell>
            <TableCell className="font-mono text-xs">
              {quotation.referenceNo}
            </TableCell>
            <TableCell>{quotation.date ?? "—"}</TableCell>
            <TableCell>{quotation.deliveryDate ?? "—"}</TableCell>
            <TableCell className="pr-4">
              {formatCurrency(quotation.total, true)}
              {quotation.total === lowestTotal ? (
                <span className="ml-2 text-[10px] tracking-wide text-status-success uppercase">
                  Lowest
                </span>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CanvassingItemCard({
  item,
  canvassingItem,
}: {
  item: PurchaseRequestItem;
  canvassingItem: PurchaseRequestCanvassingItem | undefined;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm">{item.name}</CardTitle>
          <span className="text-xs text-muted-foreground">
            Qty {item.quantity} {item.unit ?? ""}
          </span>
        </div>
        <StatusBadge tone={itemStatusTone(item.status)}>
          {itemStatusLabel(item.status)}
        </StatusBadge>
      </CardHeader>
      <CardContent className="px-0">
        <QuotationsTable quotations={canvassingItem?.quotations ?? []} />
      </CardContent>
    </Card>
  );
}

export function CanvassingDetailView({
  purchaseRequestId,
}: {
  purchaseRequestId: string;
}) {
  const {
    data: request,
    isPending: requestPending,
    isError: requestErrored,
    error: requestError,
  } = useQuery(purchaseRequestDetailQuery(purchaseRequestId));

  const {
    data: canvassing,
    isPending: canvassingPending,
    isError: canvassingErrored,
    error: canvassingError,
  } = useQuery(purchaseRequestCanvassingQuery(purchaseRequestId));

  if (requestErrored) {
    return (
      <>
        <PageHeader
          title="Canvassing"
          actions={
            <Button
              variant="outline"
              render={<Link href="/canvassing" />}
              nativeButton={false}
            >
              Back to Canvassing
            </Button>
          }
        />
        <ErrorAlert
          title="Couldn't load this purchase request"
          error={requestError}
        />
      </>
    );
  }

  if (requestPending) return <DetailSkeleton />;

  const canvassingById = new Map(
    (canvassing?.items ?? []).map((item) => [item.id, item]),
  );
  const itemsNeedingCanvass = request.items.filter(
    (item) => item.sourcing === "canvassing",
  );
  const directItems = request.items.filter(
    (item) => item.sourcing !== "canvassing",
  );

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            Canvassing —{" "}
            <span className="font-mono text-base">{request.no}</span>
            <PriorityBadge priority={request.priority} />
          </span>
        }
        description={
          <>
            <span className="block text-sm text-foreground">
              {request.title ?? (
                <span className="text-muted-foreground italic">Untitled</span>
              )}
            </span>
            <span className="block">
              {request.department} · {itemsNeedingCanvass.length}{" "}
              {itemsNeedingCanvass.length === 1 ? "item" : "items"} out for
              quotation
            </span>
          </>
        }
        actions={
          <Button
            variant="outline"
            render={<Link href={`/purchase-requests/${request.id}`} />}
            nativeButton={false}
          >
            View Purchase Request
          </Button>
        }
      />

      {canvassingErrored ? (
        <ErrorAlert
          title="Couldn't load quotations for this request"
          error={canvassingError}
        />
      ) : null}

      {itemsNeedingCanvass.length === 0 ? (
        <Card>
          <CardContent className="text-xs text-muted-foreground">
            No items on this request need canvassing.
          </CardContent>
        </Card>
      ) : canvassingPending ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        itemsNeedingCanvass.map((item) => (
          <CanvassingItemCard
            key={item.id}
            item={item}
            canvassingItem={canvassingById.get(item.id)}
          />
        ))
      )}

      {directItems.length > 0 ? (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-xs">Directly Sourced Items</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="pl-4">
                    Item
                  </TableHead>
                  <TableHead scope="col">Qty</TableHead>
                  <TableHead scope="col" className="pr-4">
                    Vendor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="pl-4">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="pr-4">
                      {item.vendor ?? (
                        <span className="text-muted-foreground italic">
                          Not set
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
