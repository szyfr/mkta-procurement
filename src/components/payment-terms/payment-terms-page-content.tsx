"use client";

import { PlusIcon } from "lucide-react";
import * as React from "react";

import { PaymentTermFormDialog } from "@/components/payment-terms/payment-term-form-dialog";
import { PaymentTermListView } from "@/components/payment-terms/payment-term-list-view";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { PaymentTerm } from "@/modules/payment-terms";

/**
 * Owns the one thing the list and the create/edit dialog have to agree on:
 * which dialog, if any, is open. Refetching after a save is handled by the
 * mutations invalidating the payment term cache.
 */
export function PaymentTermsPageContent({ page }: { page: number }) {
  const [dialogState, setDialogState] = React.useState<
    { mode: "create" } | { mode: "edit"; paymentTerm: PaymentTerm } | null
  >(null);

  return (
    <>
      <PageHeader
        title="Payment Terms"
        description="Manage the payment terms available when creating a quotation"
        actions={
          <Button
            variant="outline"
            onClick={() => setDialogState({ mode: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            New Payment Term
          </Button>
        }
      />

      <PaymentTermListView
        page={page}
        onEdit={(paymentTerm) => setDialogState({ mode: "edit", paymentTerm })}
      />

      <PaymentTermFormDialog
        open={dialogState !== null}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        paymentTerm={
          dialogState?.mode === "edit" ? dialogState.paymentTerm : null
        }
      />
    </>
  );
}
