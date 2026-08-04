import type * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Cycled widths so the placeholder cards don't read as identical clones. */
const titleWidths = ["w-3/4", "w-2/3", "w-4/5", "w-1/2", "w-3/5", "w-11/12"];
const metaWidths = ["w-2/3", "w-1/2", "w-3/5", "w-3/4", "w-2/5", "w-7/12"];

/**
 * Placeholder shown while the purchase request cards load. It mirrors
 * {@link PurchaseRequestCard} — accent stripe, number and priority row, title,
 * requester line, amount, status footer — so the grid settles in place instead
 * of reflowing once the requests land.
 */
export function PurchaseRequestCardsSkeleton({
  cards = 6,
}: {
  cards?: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {/* Absolutely positioned by `sr-only`, so it announces without taking space. */}
      <output className="sr-only">Loading purchase requests…</output>
      {Array.from({ length: cards }, (_, card) => (
        // The status colour is unknown while loading, so the stripe stays
        // neutral rather than implying a status the request may not have.
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder cards
          key={card}
          className="border-l-2 border-l-muted [&_[data-slot=skeleton]]:[animation-delay:var(--pulse-delay)]"
          // Cards pulse in sequence, which reads as loading rather than as one
          // block flashing. Set once here since animation delay doesn't inherit.
          style={{ "--pulse-delay": `${card * 90}ms` } as React.CSSProperties}
        >
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <Skeleton
              className={cn("h-3", titleWidths[card % titleWidths.length])}
            />
            <Skeleton
              className={cn("h-4", metaWidths[card % metaWidths.length])}
            />
            <Skeleton className="h-5 w-28" />

            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
