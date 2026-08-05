"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { PaymentTermForm } from "@/components/payment-terms/payment-term-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
  type CreatePaymentTermDto,
  createPaymentTerm,
  type PaymentTerm,
  paymentTermKeys,
  updatePaymentTerm,
} from "@/modules/payment-terms";

/**
 * Create/edit dialog. A single instance handles both modes — passing
 * `paymentTerm` switches it to edit, pre-filled from the row already loaded
 * by the list (no extra fetch needed).
 */
export function PaymentTermFormDialog({
  open,
  onOpenChange,
  paymentTerm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentTerm?: PaymentTerm | null;
}) {
  const isEdit = Boolean(paymentTerm);
  const queryClient = useQueryClient();

  const {
    mutate: save,
    isPending: submitting,
    error,
    reset,
  } = useMutation({
    mutationFn: (values: CreatePaymentTermDto) =>
      isEdit && paymentTerm
        ? updatePaymentTerm(paymentTerm._id, values)
        : createPaymentTerm(values),
    onSuccess: (_saved, values) => {
      toast.add({
        title: isEdit ? "Payment term updated" : "Payment term created",
        description: isEdit
          ? `"${values.title}" was saved.`
          : `"${values.title}" was added.`,
        type: "success",
      });

      onOpenChange(false);
      // The list refetches off this rather than a reload token from the page.
      queryClient.invalidateQueries({ queryKey: paymentTermKeys.all });
    },
  });

  // Clear stale request state each time the dialog is opened.
  React.useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Payment Term" : "New Payment Term"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this payment term's details."
              : "Add a payment term that can be selected when creating a quotation."}
          </DialogDescription>
        </DialogHeader>

        <PaymentTermForm
          key={paymentTerm?._id ?? "create"}
          initialValues={
            paymentTerm
              ? {
                  title: paymentTerm.title,
                  description: paymentTerm.description,
                }
              : undefined
          }
          submitLabel={isEdit ? "Save Changes" : "Create Payment Term"}
          submitting={submitting}
          error={
            error
              ? error instanceof Error
                ? error.message
                : "Something went wrong."
              : null
          }
          onSubmit={save}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
