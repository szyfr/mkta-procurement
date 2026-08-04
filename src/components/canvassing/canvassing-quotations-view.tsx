"use client";

import { useQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AwardVendorDialog } from "@/components/canvassing/award-vendor-dialog";
import { QuotationDetailDialog } from "@/components/canvassing/quotation-detail-dialog";
import { ErrorAlert } from "@/components/shared/query-states";
import { StatusBadge } from "@/components/shared/status-badge";
import { dataTableClass } from "@/components/shared/table-classes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  canvassingQuotationsQuery,
  type ItemQuotations,
} from "@/modules/canvassing";
import { purchaseRequestDetailQuery } from "@/modules/purchase-requests";

/**
 * The quote comparison: one section per item out for canvassing, listing the
 * vendors that have quoted it.
 *
 * There are no batches here because the backend has no such concept — quotes
 * attach to a purchase request item, and a quote covering several items is
 * simply repeated under each one it prices.
 *
 * Awarding writes through `PATCH /canvassing/award/{quotation_id}`, which
 * stamps the winning quotation's id onto the item. `GET /canvassing/quotations`
 * echoes it back as `quotation_id`, so which row won survives a reload rather
 * than living only in this component's state.
 */
export function CanvassingQuotationsView({ id }: { id: string }) {
  // The same query the items card runs, so this shares its cache entry rather
  // than fetching the request twice.
  const { data: request, isError: requestFailed } = useQuery(
    purchaseRequestDetailQuery(id),
  );

  // Only items routed to canvassing can be quoted; a direct-sourced item always
  // comes back with an empty list.
  const canvassingItems =
    request?.items.filter((item) => item.sourcing === "canvassing") ?? [];
  const itemIds = canvassingItems.map((item) => item.id);

  const {
    data: quoted,
    isPending,
    isError,
    error,
  } = useQuery(canvassingQuotationsQuery(itemIds));

  const [selected, setSelected] = React.useState<Record<string, string>>({});

  // The request itself failing is already reported by the items card above.
  if (requestFailed) return null;
  if (request && canvassingItems.length === 0) return null;

  if (isError) {
    return <ErrorAlert title="Couldn't load quotations" error={error} />;
  }

  if (!request || isPending) {
    return (
      <>
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-48 w-full" />
      </>
    );
  }

  const byItemId = new Map(quoted.map((entry) => [entry.itemId, entry]));

  return (
    <>
      {canvassingItems.map((item) => (
        <QuoteComparison
          key={item.id}
          purchaseRequestId={id}
          item={item}
          // An item the aggregation didn't return has simply never been quoted.
          quotations={byItemId.get(item.id)?.quotations ?? []}
          selected={selected[item.id] ?? null}
          onSelect={(quotationId) =>
            setSelected((current) => ({ ...current, [item.id]: quotationId }))
          }
          awardedQuotationId={byItemId.get(item.id)?.awardedQuotationId ?? null}
          awardedOn={byItemId.get(item.id)?.awardedOn ?? null}
        />
      ))}
    </>
  );
}

function QuoteComparison({
  purchaseRequestId,
  item,
  quotations,
  selected,
  onSelect,
  awardedQuotationId,
  awardedOn,
}: {
  purchaseRequestId: string;
  item: PurchaseRequestItem;
  quotations: ItemQuotations["quotations"];
  selected: string | null;
  onSelect: (quotationId: string) => void;
  awardedQuotationId: string | null;
  awardedOn: string | null;
}) {
  const quantity = `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`;

  if (awardedQuotationId) {
    const winner =
      quotations.find((quotation) => quotation.id === awardedQuotationId) ??
      null;

    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-medium">{item.name}</h2>
            <p className="text-xs text-muted-foreground">
              Vendor already selected for this item
            </p>
          </div>
          <StatusBadge tone="success">
            Vendor Selected{winner ? ` — ${winner.vendorId}` : ""}
          </StatusBadge>
        </div>

        <Card>
          <CardContent className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Winning Price</p>
              <p>
                {winner?.unitPrice == null
                  ? "—"
                  : formatCurrency(winner.unitPrice, true)}
                {winner ? ` · ${winner.vendorId}` : ""}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Delivery Estimate</p>
              <p>{winner?.deliveryDate ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quotes Received</p>
              <p>
                {quotations.length}{" "}
                {quotations.length === 1 ? "quote" : "quotes"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Selected On</p>
              <p>{awardedOn ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const selectedQuotation =
    quotations.find((quotation) => quotation.id === selected) ?? null;

  // The cheapest quote is the one the comparison exists to surface. Ties keep
  // the first row, which is the order the backend returned.
  const lowestPrice = quotations.reduce<number | null>(
    (lowest, quotation) =>
      quotation.unitPrice !== null &&
      (lowest === null || quotation.unitPrice < lowest)
        ? quotation.unitPrice
        : lowest,
    null,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium">{item.name}</h2>
          <p className="text-xs text-muted-foreground">
            {quantity} out for quotation
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* The count is all that's real — the backend enforces no quote minimum. */}
          <StatusBadge tone={quotations.length > 0 ? "success" : "neutral"}>
            {quotations.length} {quotations.length === 1 ? "quote" : "quotes"}{" "}
            received
          </StatusBadge>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/purchase-requests/${purchaseRequestId}/canvassing/quotes/new?items=${item.id}`}
              />
            }
          >
            + Add Vendor Quote
          </Button>
        </div>
      </div>

      {quotations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <InboxIcon className="size-6 text-muted-foreground" />
            <p className="font-medium text-sm">No quotes yet</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              No quotes have been entered for this item yet. Add a vendor quote
              to start the comparison.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              nativeButton={false}
              render={
                <Link
                  href={`/purchase-requests/${purchaseRequestId}/canvassing/quotes/new?items=${item.id}`}
                />
              }
            >
              + Add Vendor Quote
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="px-0">
            <RadioGroup
              value={selected}
              onValueChange={(value) => onSelect(String(value))}
              aria-label={`Select winning vendor for ${item.name}`}
              className="block"
            >
              <Table className={dataTableClass}>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="w-8">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead scope="col">Vendor ID</TableHead>
                    <TableHead scope="col">Reference</TableHead>
                    <TableHead scope="col">Unit Price</TableHead>
                    <TableHead scope="col">Total</TableHead>
                    <TableHead scope="col">Delivery</TableHead>
                    <TableHead scope="col">Quote Date</TableHead>
                    <TableHead scope="col">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotations.map((quotation) => {
                    const isLowest =
                      quotation.unitPrice !== null &&
                      quotation.unitPrice === lowestPrice;

                    return (
                      <TableRow
                        key={quotation.id}
                        className={cn(isLowest && "bg-status-success-subtle")}
                      >
                        <TableCell>
                          <RadioGroupItem
                            value={quotation.id}
                            aria-label={`Select vendor ${quotation.vendorId}`}
                          />
                        </TableCell>
                        {/* No vendor join upstream — the id stands in for the name. */}
                        <TableCell
                          className={cn(
                            "font-mono text-xs",
                            isLowest && "font-semibold text-status-success-fg",
                          )}
                        >
                          {quotation.vendorId}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {quotation.referenceNo}
                        </TableCell>
                        <TableCell
                          className={cn(
                            isLowest && "font-semibold text-status-success-fg",
                          )}
                        >
                          {quotation.unitPrice === null
                            ? "—"
                            : formatCurrency(quotation.unitPrice, true)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            isLowest && "font-semibold text-status-success-fg",
                          )}
                        >
                          {quotation.unitPrice === null
                            ? "—"
                            : formatCurrency(
                                quotation.unitPrice * item.quantity,
                                true,
                              )}
                        </TableCell>
                        <TableCell>{quotation.deliveryDate ?? "—"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {quotation.quotedOn ?? "—"}
                        </TableCell>
                        <TableCell>
                          <QuotationDetailDialog
                            quotationId={quotation.id}
                            itemId={item.id}
                            itemName={item.name}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </RadioGroup>
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Pick the winning quote, then confirm the vendor.
            </span>
            <AwardVendorDialog
              quotationId={selected}
              itemId={item.id}
              itemName={item.name}
              vendorId={selectedQuotation?.vendorId ?? null}
              unitPrice={selectedQuotation?.unitPrice ?? null}
              quantity={quantity}
            />
          </CardFooter>
        </Card>
      )}
    </section>
  );
}
