"use client";

import Link from "next/link";
import * as React from "react";
import { DataError } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelectVendor } from "@/hooks/canvassing";
import type { CanvassingBatch } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * Vendor quote comparison for one batch. Selecting a row nominates a winner;
 * confirming it is a separate, explicit action.
 */
export function BatchComparison({
  purchaseRequestId,
  batch,
}: {
  purchaseRequestId: string;
  batch: CanvassingBatch;
}) {
  // A batch can exist before any quote has been entered, so this reduce needs a
  // seed — without one it throws on an empty array.
  const lowest = batch.quotes.reduce<CanvassingBatch["quotes"][number] | null>(
    (cheapest, quote) =>
      cheapest === null || quote.total < cheapest.total ? quote : cheapest,
    null,
  );

  const selectVendor = useSelectVendor(purchaseRequestId);
  const [selected, setSelected] = React.useState(
    batch.selectedVendorId ?? lowest?.id ?? "",
  );

  const selectedQuote = batch.quotes.find((quote) => quote.id === selected);
  const itemNames = batch.items.map((item) => item.name).join(", ");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium">
            Batch {batch.batch} — {itemNames}
          </h2>
          <p className="text-xs text-muted-foreground">
            {batch.items.length}{" "}
            {batch.items.length === 1 ? "item" : "items grouped together"} for
            shared vendor sourcing
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            tone={
              batch.quotesReceived >= batch.quotesRequired ? "neutral" : "info"
            }
          >
            {batch.quotesReceived} of {batch.quotesRequired} minimum quotes
            received
          </StatusBadge>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={`/canvassing/${purchaseRequestId}/quotes/new?batch=${batch.batch}`}
              />
            }
          >
            + Add Vendor Quote
          </Button>
        </div>
      </div>

      <Card>
        {batch.quotes.length === 0 ? (
          <CardContent className="py-8 text-center text-xs text-muted-foreground">
            No quotes have been entered for this batch yet. Add a vendor quote
            to start the comparison.
          </CardContent>
        ) : (
          <>
            <CardContent className="px-0">
              <RadioGroup
                value={selected}
                onValueChange={(value) => setSelected(value as string)}
                aria-label={`Select winning vendor for batch ${batch.batch}`}
                className="block"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col" className="w-8 pl-4">
                        <span className="sr-only">Select</span>
                      </TableHead>
                      <TableHead scope="col">Vendor</TableHead>
                      <TableHead scope="col">
                        Total Price
                        {batch.items.length > 1 ? " (All Items)" : ""}
                      </TableHead>
                      <TableHead scope="col">Delivery Estimate</TableHead>
                      <TableHead scope="col">Quote Date</TableHead>
                      <TableHead scope="col" className="pr-4">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batch.quotes.map((quote) => {
                      const isSelected = quote.id === selected;
                      const isLowest = quote.id === lowest?.id;

                      return (
                        <TableRow
                          key={quote.id}
                          className={cn(isSelected && "bg-status-success/10")}
                        >
                          <TableCell className="pl-4">
                            <RadioGroupItem
                              value={quote.id}
                              aria-label={`Select ${quote.vendor}`}
                            />
                          </TableCell>
                          <TableCell
                            className={cn(
                              isLowest && "font-medium text-status-success",
                            )}
                          >
                            {quote.vendor}
                          </TableCell>
                          <TableCell
                            className={cn(
                              isLowest && "font-medium text-status-success",
                            )}
                          >
                            {formatCurrency(quote.total, true)}
                          </TableCell>
                          <TableCell>{quote.deliveryEstimate}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {quote.quoteDate}
                          </TableCell>
                          <TableCell className="pr-4">
                            <StatusBadge tone="success">Received</StatusBadge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3">
              {selectVendor.isError ? (
                <DataError
                  error={selectVendor.error}
                  title="Could not confirm the vendor"
                />
              ) : null}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!selectedQuote || selectVendor.isPending}
                  onClick={() =>
                    selectedQuote &&
                    selectVendor.mutate({
                      batch: batch.batch,
                      quoteId: selectedQuote.id,
                    })
                  }
                >
                  {selectVendor.isPending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Confirming
                    </>
                  ) : (
                    <>
                      Confirm Vendor Selection
                      {selectedQuote ? ` — ${selectedQuote.vendor}` : ""}
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </section>
  );
}
