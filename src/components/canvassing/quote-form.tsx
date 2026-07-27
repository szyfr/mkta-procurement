"use client";

import * as React from "react";

import { FilterSelect } from "@/components/shared/filter-select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { paymentTerms, vendors } from "@/data/purchase-requests";
import type { CanvassingBatch } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Captures one vendor's quote for every item in a batch. Line and grand totals
 * update as unit prices are entered.
 */
export function QuoteForm({ batch }: { batch: CanvassingBatch }) {
  const [unitPrices, setUnitPrices] = React.useState<Record<string, number>>(
    () => Object.fromEntries(batch.items.map((item) => [item.id, 0])),
  );

  const total = batch.items.reduce(
    (sum, item) => sum + item.quantity * (unitPrices[item.id] ?? 0),
    0,
  );

  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Vendor &amp; Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
            <Field className="sm:col-span-2">
              <FieldLabel>Vendor</FieldLabel>
              <FilterSelect
                label="Search or select a vendor…"
                options={vendors}
                className="w-full"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="quote-ref">Quote Reference No.</FieldLabel>
              <Input
                id="quote-ref"
                name="quoteRef"
                placeholder="Vendor's quotation number"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="quote-date">Quote Date</FieldLabel>
              <Input id="quote-date" name="quoteDate" type="date" />
            </Field>

            <Field>
              <FieldLabel htmlFor="delivery-estimate">
                Delivery Estimate
              </FieldLabel>
              <Input
                id="delivery-estimate"
                name="deliveryEstimate"
                placeholder="e.g. 5 business days"
              />
            </Field>

            <Field>
              <FieldLabel>Payment Terms</FieldLabel>
              <FilterSelect
                label="Select terms"
                options={paymentTerms}
                className="w-full"
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
          <CardTitle>Item Pricing</CardTitle>
          <span className="text-xs text-muted-foreground">
            {batch.items.length === 1
              ? "The item in this batch, priced by this vendor"
              : "All items in this batch, priced by this vendor"}
          </span>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="pl-4">
                  Item
                </TableHead>
                <TableHead scope="col">Qty</TableHead>
                <TableHead scope="col">Unit Price</TableHead>
                <TableHead scope="col" className="pr-4">
                  Line Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batch.items.map((item) => {
                const unitPrice = unitPrices[item.id] ?? 0;
                const lineTotal = item.quantity * unitPrice;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="pl-4">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={unitPrice}
                        aria-label={`Unit price for ${item.name}`}
                        className="h-7 w-28"
                        onChange={(event) =>
                          setUnitPrices((current) => ({
                            ...current,
                            [item.id]: Number(event.target.value) || 0,
                          }))
                        }
                      />
                    </TableCell>
                    <TableCell className="pr-4">
                      {formatCurrency(lineTotal, true)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-end">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Quote Amount</p>
            <p className="text-lg font-semibold">
              {formatCurrency(total, true)}
            </p>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Quotation Document</CardTitle>
        </CardHeader>
        <CardContent>
          <label
            htmlFor="quotation-document"
            className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground hover:bg-muted/50"
          >
            Upload vendor&apos;s quotation (PDF, email screenshot, or signed
            document)
            <input
              id="quotation-document"
              name="quotationDocument"
              type="file"
              className="sr-only"
            />
          </label>
        </CardContent>
      </Card>
    </>
  );
}
