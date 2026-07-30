"use client";

import Link from "next/link";
import * as React from "react";

import { PurchaseRequestItemsTable } from "@/components/purchase-requests/pr-items-table";
import { PurchaseRequestStepper } from "@/components/purchase-requests/pr-stepper";
import { ProofOfOrderForm } from "@/components/purchase-requests/proof-of-order-form";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { purchaseRequestTone } from "@/data/purchase-requests";
import { formatCurrency } from "@/lib/utils";
import {
  fetchPurchaseRequest,
  type PurchaseRequest,
  priorityToDto,
  updatePurchaseRequest,
} from "@/modules/purchase-requests";

/**
 * Purchase request detail, fetched from the BFF in the browser.
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
  const [request, setRequest] = React.useState<PurchaseRequest | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    setRequest(null);
    setError(null);

    fetchPurchaseRequest(id, controller.signal)
      .then(setRequest)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error ? cause.message : "Something went wrong.",
        );
      });

    return () => controller.abort();
  }, [id]);

  if (error) {
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
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load this purchase request</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </>
    );
  }

  if (!request) return <DetailSkeleton />;

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

  async function submitForApproval() {
    if (!request) return;

    setSubmitError(null);

    if (!request.title?.trim()) {
      setSubmitError("Add a title before submitting — use Continue Editing.");
      return;
    }
    if (request.items.length === 0) {
      setSubmitError(
        "Add at least one item before submitting — use Continue Editing.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const updated = await updatePurchaseRequest(request.id, {
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

      setRequest(updated);
    } catch (cause) {
      setSubmitError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-base">{request.id}</span>
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
