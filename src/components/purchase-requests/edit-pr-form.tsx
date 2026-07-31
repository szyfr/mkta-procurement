"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { PurchaseRequestFormLayout } from "@/components/purchase-requests/pr-form-layout";
import { usePurchaseRequestForm } from "@/components/purchase-requests/use-pr-form";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorAlert } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  purchaseRequestDetailQuery,
  purchaseRequestKeys,
  type UpdatePurchaseRequestPayload,
  updatePurchaseRequest,
} from "@/modules/purchase-requests";

/**
 * Edit form for an existing request. Fetches the request once on mount, then
 * behaves like the create form — same fields, same line item editor — but
 * PUTs the changes back instead of POSTing a new request.
 */

const submissionChecklist = [
  "Items that need canvassing are routed there automatically; direct items let you pick a vendor now.",
  "Every item needs a quantity before submitting.",
  "Estimated costs are for approval routing only and aren't saved — the backend has no field for them yet.",
  "Attachments aren't wired up yet and won't be saved with the request.",
];

const routingNote =
  "Approval routing isn't modelled on the backend yet. Requests move on once their items are processed.";

function EditFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 w-full lg:col-span-2" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function EditPurchaseRequestForm({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = usePurchaseRequestForm();

  const {
    data: request,
    isPending: loading,
    isError,
    error: loadError,
  } = useQuery(purchaseRequestDetailQuery(id));

  const {
    mutate: save,
    isPending: saving,
    error,
    variables,
  } = useMutation({
    mutationFn: (payload: UpdatePurchaseRequestPayload) =>
      updatePurchaseRequest(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(purchaseRequestKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: purchaseRequestKeys.lists() });
      router.push(`/purchase-requests/${updated.id}`);
    },
  });

  // One mutation drives both buttons; which is busy comes from the payload it
  // was called with, keeping the two spinners independent as before.
  const savingChanges = saving && variables?.status === undefined;
  const submittingForApproval = saving && variables?.status === "pending";

  /**
   * Seeds the form from the fetched request, once per request. The ref matters:
   * these fields are editable from here on, so a later background refetch
   * handing back a new object must not overwrite what the user has typed.
   */
  const seededRef = React.useRef<string | null>(null);
  const { seedFrom } = form;

  React.useEffect(() => {
    if (!request || seededRef.current === request.id) return;
    seededRef.current = request.id;

    seedFrom(request);
  }, [request, seedFrom]);

  function submitForm(status?: "pending") {
    const payload = form.validate();
    if (!payload) return;

    save({ ...payload, ...(status === undefined ? {} : { status }) });
  }

  if (isError) {
    return (
      <>
        <PageHeader
          title="Edit Purchase Request"
          actions={
            <Button
              variant="outline"
              render={<Link href="/purchase-requests" />}
              nativeButton={false}
            >
              Back to Purchase Requests
            </Button>
          }
        />
        <ErrorAlert
          title="Couldn't load this purchase request"
          error={loadError}
        />
      </>
    );
  }

  if (loading) return <EditFormSkeleton />;

  return (
    <>
      <PageHeader
        title="Edit Purchase Request"
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href={`/purchase-requests/${id}`} />}
              nativeButton={false}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => submitForm()}
              disabled={savingChanges || submittingForApproval}
            >
              {savingChanges ? <Spinner data-icon="inline-start" /> : null}
              Save Changes
            </Button>
            <Button
              onClick={() => submitForm("pending")}
              disabled={savingChanges || submittingForApproval}
            >
              {submittingForApproval ? (
                <Spinner data-icon="inline-start" />
              ) : null}
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
