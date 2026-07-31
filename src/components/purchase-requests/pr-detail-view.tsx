"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import * as React from "react";

import { PurchaseRequestItemsTable } from "@/components/purchase-requests/pr-items-table";
import { PurchaseRequestStepper } from "@/components/purchase-requests/pr-stepper";
import { ProofOfOrderForm } from "@/components/purchase-requests/proof-of-order-form";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ErrorAlert } from "@/components/shared/query-states";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import {
  type PurchaseRequest,
  priorityToDto,
  purchaseRequestDetailQuery,
  purchaseRequestKeys,
  purchaseRequestTone,
  type UpdatePurchaseRequestPayload,
  updatePurchaseRequest,
} from "@/modules/purchase-requests";

/**
 * Purchase request detail, fetched from the BFF in the browser via TanStack
 * Query.
 *
 * Several panels the wireframe shows have no backend behind them yet —
 * documents, comments, activity history and the action panel. They already
 * render conditionally, so they simply stay hidden rather than being filled
 * with placeholder content.
 */

/** Summary line under the title, assembled from whatever the backend gave us. */
function metaLine(request: PurchaseRequest) {
  const parts = [request.requester, request.department];

  // No submitted/completed/rejected timestamps are stored, so the created date
  // is the only point in the request's history we can show.
  if (request.createdAt) parts.push(`Created ${request.createdAt}`);

  const itemCount = `${request.items.length} ${
    request.items.length === 1 ? "item" : "items"
  }`;

  parts.push(
    request.amount === null
      ? `Amount unavailable (${itemCount})`
      : `${formatCurrency(request.amount)} total (${itemCount})`,
  );

  return parts.join(" · ");
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 w-full lg:col-span-2" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function PurchaseRequestDetailView({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const {
    data: request,
    isPending,
    isError,
    error,
  } = useQuery(purchaseRequestDetailQuery(id));

  /**
   * Submitting fails two ways: the request can be incomplete, which is caught
   * here before anything is sent, or the PUT itself can fail. The banner shows
   * whichever happened, so the local check is kept alongside the mutation's
   * own error.
   */
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  const {
    mutate: submit,
    isPending: submitting,
    error: submitFailure,
    reset: resetSubmit,
  } = useMutation({
    mutationFn: (payload: UpdatePurchaseRequestPayload) =>
      updatePurchaseRequest(id, payload),
    onSuccess: (updated) => {
      // Show the new status straight away, and let the list pick it up too.
      queryClient.setQueryData(purchaseRequestKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: purchaseRequestKeys.lists() });
    },
  });

  const submitError =
    validationError ??
    (submitFailure
      ? submitFailure instanceof Error
        ? submitFailure.message
        : "Something went wrong."
      : null);

  if (isError) {
    return (
      <>
        <PageHeader
          title="Purchase Request"
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
        <ErrorAlert title="Couldn't load this purchase request" error={error} />
      </>
    );
  }

  if (isPending) return <DetailSkeleton />;

  const isDraft = request.status === "draft";
  const isRejected = request.status === "rejected";
  const deliveredCount = request.items.filter(
    (item) => item.status === "completed",
  ).length;
  const awaitingProof = request.items.find(
    (item) => item.status === "po-created",
  );
  const canvassingItem = request.items.find(
    (item) => item.status === "canvassing",
  );

  function submitForApproval() {
    if (!request) return;

    setValidationError(null);
    resetSubmit();

    if (!request.title?.trim()) {
      setValidationError(
        "Add a title before submitting — use Continue Editing.",
      );
      return;
    }
    if (request.items.length === 0) {
      setValidationError(
        "Add at least one item before submitting — use Continue Editing.",
      );
      return;
    }

    submit({
      title: request.title.trim(),
      departmentId: request.departmentId,
      dateNeeded: request.dateNeededValue,
      priority: priorityToDto[request.priority],
      justification: request.justification,
      items: request.items.map((item) => ({
        materialId: item.materialId,
        quantity: item.quantity,
        vendorId: item.vendorId,
      })),
      status: "pending",
    });
  }

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base">{request.no}</span>
            <StatusBadge tone={purchaseRequestTone[request.status]}>
              {request.statusLabel}
            </StatusBadge>
            <PriorityBadge priority={request.priority} />
          </span>
        }
        description={
          <>
            <span className="block text-sm text-foreground">
              {request.title ?? (
                <span className="italic text-muted-foreground">
                  Untitled — add a title while editing
                </span>
              )}
            </span>
            <span className="block">{metaLine(request)}</span>
          </>
        }
        actions={
          isDraft ? (
            <>
              <Button variant="outline" size="sm">
                Cancel Request
              </Button>
              <Button
                variant="outline"
                render={<Link href={`/purchase-requests/${request.id}/edit`} />}
                nativeButton={false}
              >
                Continue Editing
              </Button>
              <Button onClick={submitForApproval} disabled={submitting}>
                {submitting ? <Spinner data-icon="inline-start" /> : null}
                Submit for Approval
              </Button>
            </>
          ) : isRejected ? (
            <Button
              render={<Link href="/purchase-requests/new" />}
              nativeButton={false}
            >
              Revise &amp; Resubmit
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm">
                Download PDF
              </Button>
              {request.status !== "completed" ? (
                <Button variant="outline" size="sm">
                  Cancel Request
                </Button>
              ) : null}
            </>
          )
        }
      />

      {submitError ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t submit this request</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      ) : null}

      {isDraft ? (
        <Card>
          <CardContent className="text-xs text-muted-foreground">
            No approval workflow has started — nothing to show here until you
            submit.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <PurchaseRequestStepper status={request.status} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
              <CardTitle>Items</CardTitle>
              <span className="text-xs text-muted-foreground">
                {deliveredCount} of {request.items.length} completed
              </span>
            </CardHeader>
            <CardContent className="px-0">
              {request.items.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No items on this request.
                </p>
              ) : (
                <PurchaseRequestItemsTable request={request} />
              )}
            </CardContent>
          </Card>

          {awaitingProof ? (
            <ProofOfOrderForm itemName={awaitingProof.name} />
          ) : null}

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xs">Justification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {request.justification || "No justification provided."}
              </p>
            </CardContent>
          </Card>

          {isDraft ? null : (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xs">Comments</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  Comments aren&apos;t stored yet — this panel is inert until
                  the backend supports them.
                </p>
                <Textarea
                  aria-label="Add a comment"
                  placeholder="Add a comment…"
                  rows={2}
                  disabled
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {canvassingItem ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Action Panel</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  Items on this request are routed to canvassing and are waiting
                  on vendor quotes.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  render={<Link href={`/canvassing/${request.id}`} />}
                  nativeButton={false}
                >
                  View Canvassing
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-xs">Details</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <dl className="divide-y text-xs">
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <dt className="text-muted-foreground">Requester</dt>
                  <dd>{request.requester}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <dt className="text-muted-foreground">Department</dt>
                  <dd>{request.department}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <dt className="text-muted-foreground">Date needed</dt>
                  <dd>{request.dateNeeded ?? "—"}</dd>
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{request.createdAt ?? "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
