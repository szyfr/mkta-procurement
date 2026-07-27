import Link from "next/link";

import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { purchaseRequestTone } from "@/lib/status-tones";
import type { PurchaseRequest } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

/** Left accent stripe echoes the status colour, as in the wireframe. */
const accentClasses: Record<string, string> = {
  neutral: "border-l-status-neutral",
  info: "border-l-status-info",
  ordered: "border-l-status-ordered",
  partial: "border-l-status-partial",
  success: "border-l-status-success",
  warning: "border-l-status-warning",
  danger: "border-l-status-danger",
};

/**
 * The follow-up action a request is waiting on, if any. Drives the button at
 * the foot of the card.
 */
function nextAction(request: PurchaseRequest) {
  if (
    request.status === "po-created" ||
    request.status === "partially-completed"
  ) {
    return {
      label: "Add Proof of Order & Confirm Delivery",
      href: `/purchase-requests/${request.id}`,
    };
  }
  if (request.status === "canvassing") {
    return {
      label: "Manage Canvassing",
      href: `/canvassing/${request.id}`,
    };
  }
  return null;
}

export function PurchaseRequestCard({ request }: { request: PurchaseRequest }) {
  const tone = purchaseRequestTone[request.status];
  const action = nextAction(request);
  const href =
    request.status === "draft"
      ? "/purchase-requests/new"
      : `/purchase-requests/${request.id}`;

  return (
    <Card
      className={cn(
        "border-l-4 transition-colors hover:ring-foreground/20",
        accentClasses[tone],
      )}
    >
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link href={href} className="font-medium hover:underline">
            {request.id}
          </Link>
          <PriorityBadge priority={request.priority} />
        </div>

        {request.title ? (
          <p className="text-xs text-muted-foreground">
            {request.title}
            {request.autoTitle ? (
              <span className="italic"> (auto-generated title)</span>
            ) : null}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Untitled — add a title while editing
          </p>
        )}

        <p className="text-sm text-muted-foreground">
          {request.requester} · {request.department}
        </p>
        <p className="font-semibold">{formatCurrency(request.amount)}</p>

        <div className="flex items-center justify-between gap-2">
          <StatusBadge tone={tone}>{request.statusLabel}</StatusBadge>
          <span className="shrink-0 text-xs text-muted-foreground">
            {request.createdAt ?? "Not submitted"}
          </span>
        </div>

        {action ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-1 w-full"
            render={<Link href={action.href} />}
            nativeButton={false}
          >
            {action.label}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
