"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { breadcrumbLabels, hiddenBreadcrumbSegments } from "@/data/navigation";
import { isObjectId } from "@/lib/api/object-id";
import { purchaseRequestDetailQuery } from "@/modules/purchase-requests";

/**
 * Derives the trail from the URL so pages never have to declare it. Segments
 * without a label entry — record ids such as `PR-2026-0117` — render as-is.
 */
export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const segments = React.useMemo(
    () => pathname.split("/").filter(Boolean),
    [pathname],
  );

  // The route segment is the Mongo `_id` (used for fetches/links), but the
  // crumb should read as the human PR number — reuses the detail page's own
  // query, so this is a cache hit rather than an extra round trip.
  const purchaseRequestId =
    segments[0] === "purchase-requests" && isObjectId(segments[1])
      ? segments[1]
      : undefined;
  const { data: purchaseRequest } = useQuery({
    ...purchaseRequestDetailQuery(purchaseRequestId ?? ""),
    enabled: Boolean(purchaseRequestId),
  });

  const crumbs = React.useMemo(() => {
    return segments
      .map((segment, index) => ({
        segment,
        label:
          segment === purchaseRequestId
            ? (purchaseRequest?.no ?? decodeURIComponent(segment))
            : (breadcrumbLabels[segment] ?? decodeURIComponent(segment)),
        href: `/${segments.slice(0, index + 1).join("/")}`,
      }))
      .filter((crumb) => !hiddenBreadcrumbSegments.has(crumb.segment));
  }, [segments, purchaseRequestId, purchaseRequest]);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList className="gap-1.5 text-[13px] sm:gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem
                className={isLast ? undefined : "hidden md:block"}
              >
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={crumb.href} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isLast ? null : (
                <BreadcrumbSeparator className="hidden md:block [&>svg]:size-3.5" />
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
