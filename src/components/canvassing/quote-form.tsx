"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { FilterSelect } from "@/components/shared/filter-select";
import { DataError } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateQuote } from "@/hooks/canvassing";
import { usePaymentTerms, useVendors } from "@/hooks/reference";
import type { CanvassingBatch } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

/**
 * Captures one vendor's quote for every item in a batch. Line and grand totals
 * update as unit prices are entered.
 *
 * Vendor and payment terms are controlled state rather than uncontrolled DOM:
 * they come from a custom select whose value cannot be read out of `FormData`.
 */
export function QuoteForm({
  purchaseRequestId,
  batch,
}: {
  purchaseRequestId: string;
  batch: CanvassingBatch;
}) {
  const router = useRouter();
  const { data: vendors = [] } = useVendors();
  const { data: paymentTerms = [] } = usePaymentTerms();
  const createQuote = useCreateQuote(purchaseRequestId);

  const [vendor, setVendor] = React.useState<string | null>(null);
  const [terms, setTerms] = React.useState<string | null>(null);
  const [documentName, setDocumentName] = React.useState<string | null>(null);
  const [unitPrices, setUnitPrices] = React.useState<Record<string, number>>(
    () => Object.fromEntries(batch.items.map((item) => [item.id, 0])),
  );

  const total = batch.items.reduce(
    (sum, item) => sum + item.quantity * (unitPrices[item.id] ?? 0),
    0,
  );

  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (!vendor) {
      setValidationError("Choose a vendor before saving this quote.");
      return;
    }
    setValidationError(null);

    createQuote.mutate(
      {
        batch: batch.batch,
        vendor,
        quoteRef: (form.get("quoteRef") as string) || null,
        quoteDate: String(form.get("quoteDate") ?? ""),
        deliveryEstimate: String(form.get("deliveryEstimate") ?? ""),
        paymentTerms: terms,
        documentName,
        lines: batch.items.map((item) => ({
          itemId: item.id,
          quantity: item.quantity,
          unitPrice: unitPrices[item.id] ?? 0,
        })),
      },
      {
        onSuccess: () => router.push(`/canvassing/${purchaseRequestId}`),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Vendor &amp; Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {validationError ? (
            <p className="text-xs text-destructive">{validationError}</p>
          ) : null}
          {createQuote.isError ? (
            <DataError
              error={createQuote.error}
              title="Could not save the quote"
            />
          ) : null}

          <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
            <Field className="sm:col-span-2">
              <FieldLabel>Vendor</FieldLabel>
              <FilterSelect
                label="Search or select a vendor…"
                options={vendors}
                className="w-full"
                value={vendor}
                onValueChange={setVendor}
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
              <Input id="quote-date" name="quoteDate" type="date" required />
            </Field>

            <Field>
              <FieldLabel htmlFor="delivery-estimate">
                Delivery Estimate
              </FieldLabel>
              <Input
                id="delivery-estimate"
                name="deliveryEstimate"
                placeholder="e.g. 5 business days"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Payment Terms</FieldLabel>
              <FilterSelect
                label="Select terms"
                options={paymentTerms}
                className="w-full"
                value={terms}
                onValueChange={setTerms}
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
            {documentName ??
              "Upload vendor's quotation (PDF, email screenshot, or signed document)"}
            <input
              id="quotation-document"
              name="quotationDocument"
              type="file"
              className="sr-only"
              onChange={(event) =>
                setDocumentName(event.currentTarget.files?.[0]?.name ?? null)
              }
            />
          </label>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/canvassing/${purchaseRequestId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createQuote.isPending}>
            {createQuote.isPending ? (
              <>
                <Spinner data-icon="inline-start" />
                Saving
              </>
            ) : (
              "Save Quote"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
