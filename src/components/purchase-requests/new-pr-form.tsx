"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PurchaseRequestFormLayout } from "@/components/purchase-requests/pr-form-layout";
import { usePurchaseRequestForm } from "@/components/purchase-requests/use-pr-form";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createPurchaseRequest } from "@/modules/purchase-requests";

/**
 * Create form. Owns all state for the request and its line items, then posts
 * once through the BFF.
 *
 * The requester is not collected here: authentication is out of scope, so the
 * BFF fills `requester_id` in server-side.
 */

const submissionChecklist = [
  "Items that need canvassing are routed there automatically; direct items let you pick a vendor now.",
  "Every item needs a quantity before submitting.",
  "Estimated costs are for approval routing only and aren't saved — the backend has no field for them yet.",
  "Attachments aren't wired up yet and won't be saved with the request.",
  "Every request is created as a draft — the backend doesn't distinguish saving from submitting yet.",
];

const routingNote =
  "Approval routing isn't modelled on the backend yet. Requests are created as drafts and move on once their items are processed.";

export function NewPurchaseRequestForm() {
  const router = useRouter();
  const form = usePurchaseRequestForm();

  const {
    mutate: create,
    isPending: submitting,
    error,
  } = useMutation({
    mutationFn: createPurchaseRequest,
    onSuccess: (created) => router.push(`/purchase-requests/${created.id}`),
  });

  function submit() {
    const payload = form.validate();
    if (payload) create(payload);
  }

  return (
    <>
      <PageHeader
        title="New Purchase Request"
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href="/purchase-requests" />}
              nativeButton={false}
            >
              Cancel
            </Button>
            {/*
              Both buttons perform the same POST: the backend accepts a status
              on create but never applies it, so every request lands as a draft.
              Called out in the checklist rather than hidden behind the labels.
            */}
            <Button variant="outline" onClick={submit} disabled={submitting}>
              Save as Draft
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              Submit for Approval
            </Button>
          </>
        }
      />

      {error ? (
        <ErrorAlert title="Couldn't save this request" error={error} />
      ) : null}

      <PurchaseRequestFormLayout
        form={form}
        checklist={submissionChecklist}
        routingNote={routingNote}
      />
    </>
  );
}
