"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";
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
import { deletePaymentTerm, paymentTermKeys } from "@/modules/payment-terms";

export function DeletePaymentTermDialog({
  paymentTerm,
}: {
  paymentTerm: { id: string; title: string };
}) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => deletePaymentTerm(paymentTerm.id),
    onSuccess: () => {
      toast.add({
        title: "Payment term deleted",
        description: `"${paymentTerm.title}" was removed.`,
        type: "success",
      });
      setOpen(false);
      // Refreshes whichever page the list is on, replacing the reload token
      // the parent used to thread down.
      queryClient.invalidateQueries({ queryKey: paymentTermKeys.all });
    },
    onError: (cause) => {
      toast.add({
        title: "Couldn't delete payment term",
        description:
          cause instanceof Error ? cause.message : "Something went wrong.",
        type: "error",
      });
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${paymentTerm.title}`}
          />
        }
      >
        <TrashIcon />
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete payment term?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &ldquo;{paymentTerm.title}&rdquo;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => remove()}
            disabled={deleting}
          >
            {deleting ? <Spinner data-icon="inline-start" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
