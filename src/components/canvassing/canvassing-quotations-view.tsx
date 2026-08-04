"use client";

import { useQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { AwardVendorDialog } from "@/components/canvassing/award-vendor-dialog";
import { QuotationDetailDialog } from "@/components/canvassing/quotation-detail-dialog";
import { ErrorAlert } from "@/components/shared/query-states";
import { StatusBadge } from "@/components/shared/status-badge";
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
 * Awarding writes through `PATCH /canvassing/award/{quotation_id}`, but this
 * read has no award join: `GET /canvassing/quotations` returns the item's
 * stored status, which the award never changes. A confirmed selection is
 * therefore remembered for the session only — reload and the section looks
 * unawarded again, while the canvassing list shows "Vendor Selected".
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
  // Which quotation each item was awarded during this session. The read carries
  // no award, so this is the only thing that can mark a section as settled.
  const [awarded, setAwarded] = React.useState<Record<string, string>>({});

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
          awarded={awarded[item.id] ?? null}
          onAwarded={(quotationId) =>
            setAwarded((current) => ({ ...current, [item.id]: quotationId }))
          }
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
  awarded,
  onAwarded,
}: {
  purchaseRequestId: string;
  item: PurchaseRequestItem;
  quotations: ItemQuotations["quotations"];
  selected: string | null;
  onSelect: (quotationId: string) => void;
  awarded: string | null;
  onAwarded: (quotationId: string) => void;
}) {
  const quantity = `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`;
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
          {awarded ? (
            <StatusBadge tone="success">Vendor selected</StatusBadge>
          ) : null}
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
              // The award can't be moved to another quote once recorded.
              disabled={awarded !== null}
              className="block"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="w-8 pl-4">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead scope="col">Vendor ID</TableHead>
                    <TableHead scope="col">Reference</TableHead>
                    <TableHead scope="col">Unit Price</TableHead>
                    <TableHead scope="col">Total</TableHead>
                    <TableHead scope="col">Delivery</TableHead>
                    <TableHead scope="col">Quote Date</TableHead>
                    <TableHead scope="col" className="pr-4">
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
                        className={cn(isLowest && "bg-status-success/10")}
                      >
                        <TableCell className="pl-4">
                          <RadioGroupItem
                            value={quotation.id}
                            aria-label={`Select vendor ${quotation.vendorId}`}
                          />
                        </TableCell>
                        {/* No vendor join upstream — the id stands in for the name. */}
                        <TableCell
                          className={cn(
                            "font-mono text-xs",
                            isLowest && "font-medium text-status-success",
                          )}
                        >
                          {quotation.vendorId}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {quotation.referenceNo}
                        </TableCell>
                        <TableCell
                          className={cn(
                            isLowest && "font-medium text-status-success",
                          )}
                        >
                          {quotation.unitPrice === null
                            ? "—"
                            : formatCurrency(quotation.unitPrice, true)}
                        </TableCell>
                        <TableCell>
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
                        <TableCell className="pr-4">
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
              {awarded
                ? "Vendor confirmed. The award is recorded on the canvassing list."
                : "Pick the winning quote, then confirm the vendor."}
            </span>
            <AwardVendorDialog
              quotationId={selected}
              itemId={item.id}
              itemName={item.name}
              vendorId={selectedQuotation?.vendorId ?? null}
              unitPrice={selectedQuotation?.unitPrice ?? null}
              quantity={quantity}
              // Awarding again inserts a second award rather than replacing the
              // first, so the section closes once it succeeds.
              disabled={awarded !== null}
              onAwarded={onAwarded}
            />
          </CardFooter>
        </Card>
      )}
    </section>
  );
}
