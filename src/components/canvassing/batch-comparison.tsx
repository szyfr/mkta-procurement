"use client";

import Link from "next/link";
import * as React from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const lowest = batch.quotes.reduce((cheapest, quote) =>
    quote.total < cheapest.total ? quote : cheapest,
  );

  const [selected, setSelected] = React.useState(
    batch.selectedVendorId ?? lowest.id,
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
              batch.quotes.length >= batch.quotesRequired ? "neutral" : "info"
            }
          >
            {batch.quotes.length} of {batch.quotesRequired} minimum quotes
            received
          </StatusBadge>
          <Button
            variant="outline"
            size="sm"
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
                  const isLowest = quote.id === lowest.id;

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
        <CardFooter className="justify-end">
          <Button size="sm" disabled={!selectedQuote}>
            Confirm Vendor Selection
            {selectedQuote ? ` — ${selectedQuote.vendor}` : ""}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
