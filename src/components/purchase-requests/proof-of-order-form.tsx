"use client";

import * as React from "react";

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

/**
 * Records the vendor's confirmation for an ordered item and marks it delivered.
 * Shown for the first item still awaiting proof.
 */
export function ProofOfOrderForm({ itemName }: { itemName: string }) {
  const fileInputId = React.useId();

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>
          Add Proof of Order &amp; Confirm Delivery — {itemName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor={fileInputId}>
              Proof of Order (vendor confirmation, invoice, or signed PO copy)
            </FieldLabel>
            <label
              htmlFor={fileInputId}
              className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground hover:bg-muted/50"
            >
              Drop file here or click to upload
              <input id={fileInputId} type="file" className="sr-only" />
            </label>
          </Field>

          <Field>
            <FieldLabel htmlFor="delivery-date">
              Confirmed Delivery Date
            </FieldLabel>
            <Input id="delivery-date" name="deliveryDate" type="date" />
          </Field>

          <Field>
            <FieldLabel htmlFor="vendor-ref">Vendor Reference No.</FieldLabel>
            <Input id="vendor-ref" name="vendorRef" placeholder="Optional" />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  );
}
