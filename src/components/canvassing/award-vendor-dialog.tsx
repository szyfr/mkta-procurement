"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { awardQuotation, canvassingKeys } from "@/modules/canvassing";

/**
 * Awards one item to the quote selected in the comparison table.
 *
 * Confirmed behind a dialog because the backend models no way back: the award
 * is an insert, nothing replaces or deletes it, and awarding again simply
 * records a second one.
 */
export function AwardVendorDialog({
  quotationId,
  itemId,
  itemName,
  vendorId,
  unitPrice,
  quantity,
  disabled,
}: {
  /** Null until a row is picked; the trigger stays disabled meanwhile. */
  quotationId: string | null;
  itemId: string;
  itemName: string;
  vendorId: string | null;
  unitPrice: number | null;
  /** Already display copy, e.g. "10 pcs". */
  quantity: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { mutate: award, isPending: awarding } = useMutation({
    mutationFn: () =>
      // Only reachable from the dialog, which the trigger keeps shut until a
      // quotation is selected.
      awardQuotation({ quotationId: quotationId as string, itemIds: [itemId] }),
    onSuccess: () => {
      toast.add({
        title: "Vendor selection confirmed",
        description: `${itemName} was awarded to the selected quote.`,
        type: "success",
      });
      setOpen(false);
      // Refetches both the canvassing list (derived status flips to "Vendor
      // Selected") and the quote comparison (the item's `quotation_id` now
      // names the winner), since both query keys share this prefix.
      queryClient.invalidateQueries({ queryKey: canvassingKeys.all });
    },
    onError: (cause) => {
      toast.add({
        title: "Couldn't confirm this vendor",
        description:
          cause instanceof Error ? cause.message : "Something went wrong.",
        type: "error",
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        disabled={disabled || quotationId === null}
        render={<Button size="sm" />}
      >
        Confirm Vendor Selection
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Award this quote?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemName} ({quantity}) will be awarded to vendor {vendorId ?? "—"}
            {unitPrice === null
              ? ""
              : ` at ${formatCurrency(unitPrice, true)} per unit`}
            . The award is recorded straight away and can&apos;t be undone from
            here.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={awarding}>
            Keep Comparing
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => award()} disabled={awarding}>
            {awarding ? <Spinner data-icon="inline-start" /> : null}
            Confirm Vendor
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
