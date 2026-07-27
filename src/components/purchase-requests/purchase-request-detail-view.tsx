"use client";

import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";

import { PurchaseRequestItemsTable } from "@/components/purchase-requests/pr-items-table";
import { PurchaseRequestStepper } from "@/components/purchase-requests/pr-stepper";
import { ProofOfOrderForm } from "@/components/purchase-requests/proof-of-order-form";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DataError, PanelSkeleton } from "@/components/shared/query-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { isNotFound, usePurchaseRequest } from "@/hooks/purchase-requests";
import { purchaseRequestTone } from "@/lib/status-tones";
import { formatCurrency } from "@/lib/utils";
import type { PurchaseRequest } from "@/types";

/** Summary line under the title, assembled from whichever dates exist. */
function metaLine(request: PurchaseRequest) {
  const parts = [request.requester, request.department];

  if (request.submittedOn) parts.push(`Submitted ${request.submittedOn}`);
  else parts.push("Not yet submitted");

  if (request.completedOn) parts.push(`Completed ${request.completedOn}`);
  if (request.rejectedOn) parts.push(`Rejected ${request.rejectedOn}`);

  parts.push(
    `${formatCurrency(request.amount)} total (${request.items.length} ${
      request.items.length === 1 ? "item" : "items"
    })`,
  );

  return parts.join(" · ");
}

export function PurchaseRequestDetailView({ id }: { id: string }) {
  const {
    data: request,
    isPending,
    isError,
    error,
    refetch,
  } = usePurchaseRequest(id);

  if (isPending) {
    return (
      <>
        <PageHeader title={id} description="Loading…" />
        <Card>
          <CardContent>
            <PanelSkeleton lines={2} />
          </CardContent>
        </Card>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="border-b">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent className="px-0">
              <PanelSkeleton lines={4} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="px-0">
              <PanelSkeleton lines={3} />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // A missing request reads as "not found", not as a failure.
  if (isError && isNotFound(error)) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon />
          </EmptyMedia>
          <EmptyTitle>Purchase request not found</EmptyTitle>
          <EmptyDescription>
            {id} does not exist, or it has been deleted.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            variant="outline"
            render={<Link href="/purchase-requests" />}
            nativeButton={false}
          >
            Back to Purchase Requests
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (isError) {
    return <DataError error={error} onRetry={() => refetch()} />;
  }

  const isDraft = request.status === "draft";
  const isRejected = request.status === "rejected";
  const deliveredCount = request.items.filter(
    (item) => item.status === "delivered",
  ).length;
  const awaitingProof = request.items.find(
    (item) => item.status === "po-created",
  );
  const canvassingItem = request.items.find(
    (item) => item.status === "canvassing",
  );

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {request.id}
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
              {request.autoTitle ? (
                <span className="italic text-muted-foreground">
                  {" "}
                  (auto-generated title)
                </span>
              ) : null}
            </span>
            <span className="block">{metaLine(request)}</span>
          </>
        }
        actions={
          isDraft ? (
            <Button
              render={<Link href="/purchase-requests/new" />}
              nativeButton={false}
            >
              Continue Editing
            </Button>
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

      {isRejected && request.rejectionReason ? (
        <Alert variant="destructive">
          <AlertTitle>Rejection reason</AlertTitle>
          <AlertDescription>{request.rejectionReason}</AlertDescription>
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
                {deliveredCount} of {request.items.length} delivered
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <PurchaseRequestItemsTable request={request} />
            </CardContent>
          </Card>

          {awaitingProof ? (
            <ProofOfOrderForm
              purchaseRequestId={request.id}
              itemId={awaitingProof.id}
              itemName={awaitingProof.name}
            />
          ) : null}

          {request.documents?.length ? (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xs">Documents</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y text-xs">
                  {request.documents.map((document) => (
                    <li
                      key={document.id}
                      className="flex items-center justify-between gap-2 px-4 py-2.5"
                    >
                      <span>{document.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {document.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {isDraft ? null : (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xs">Comments</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {request.comments?.length ? (
                  <ul className="flex flex-col gap-3 text-xs">
                    {request.comments.map((comment) => (
                      <li key={comment.id}>
                        <span className="font-medium">{comment.author}:</span>{" "}
                        <span className="text-muted-foreground">
                          {comment.body}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {comment.timestamp}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No comments yet.
                  </p>
                )}
                <Textarea
                  aria-label="Add a comment"
                  placeholder="Add a comment…"
                  rows={2}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {request.actionPanelNote ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Action Panel</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  {request.actionPanelNote}
                </p>
                {canvassingItem ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    render={<Link href={`/canvassing/${request.id}`} />}
                    nativeButton={false}
                  >
                    View Canvassing — Batch {canvassingItem.batch ?? 1}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {request.activity?.length ? (
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-xs">Activity History</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y text-xs">
                  {request.activity.map((entry) => (
                    <li key={entry.id} className="px-4 py-2.5">
                      {entry.description}
                      <span className="block text-muted-foreground">
                        {entry.timestamp}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
