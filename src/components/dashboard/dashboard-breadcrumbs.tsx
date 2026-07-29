"use client";

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

/**
 * Derives the trail from the URL so pages never have to declare it. Segments
 * without a label entry — record ids such as `PR-2026-0117` — render as-is.
 */
export function DashboardBreadcrumbs() {
    const pathname = usePathname();

    const crumbs = React.useMemo(() => {
        const segments = pathname.split("/").filter(Boolean);

        return segments
            .map((segment, index) => ({
                segment,
                label: breadcrumbLabels[segment] ?? decodeURIComponent(segment),
                href: `/${segments.slice(0, index + 1).join("/")}`,
            }))
            .filter((crumb) => !hiddenBreadcrumbSegments.has(crumb.segment));
    }, [pathname]);

    if (crumbs.length === 0) {
        return null;
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1;

                    return (
                        <React.Fragment key={crumb.href}>
                            <BreadcrumbItem
                                className={
                                    isLast ? undefined : "hidden md:block"
                                }
                            >
                                {isLast ? (
                                    <BreadcrumbPage>
                                        {crumb.label}
                                    </BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink
                                        render={<Link href={crumb.href} />}
                                    >
                                        {crumb.label}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {isLast ? null : (
                                <BreadcrumbSeparator className="hidden md:block" />
                            )}
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
