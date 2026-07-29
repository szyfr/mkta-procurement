"use client";

import { ChartNoAxesColumnIcon } from "lucide-react";
import * as React from "react";

import { ReportResult } from "@/components/reports/report-result";
import { DataError } from "@/components/shared/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useReport, useReports } from "@/hooks/reports";
import {
    defaultReportId,
    reportPresentation,
} from "@/lib/reports/presentation";
import { cn } from "@/lib/utils";
import type { ReportFilters } from "@/types";

/**
 * Report picker plus the generated result.
 *
 * The "generating" phase used to be a `setTimeout` faking latency. It is now
 * the real request state — the same UI, driven by `isFetching` instead of a
 * timer.
 */
export function ReportWorkspace({ filters }: { filters: ReportFilters }) {
    // `null` until a report is explicitly picked, so the initial pick can fall
    // back to whatever the database actually has instead of assuming
    // `defaultReportId` exists — it does not after `npm run db:clear`, which
    // seeds reference data only and leaves the reports table empty.
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const { data: reports = [], isPending: isLoadingList } = useReports();
    const activeId =
        selectedId ??
        (reports.some((entry) => entry.id === defaultReportId)
            ? defaultReportId
            : (reports[0]?.id ?? null));

    const {
        data: report,
        isFetching,
        isError,
        error,
        refetch,
    } = useReport(activeId, filters);

    if (!isLoadingList && reports.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <ChartNoAxesColumnIcon />
                            </EmptyMedia>
                            <EmptyTitle>No reports available</EmptyTitle>
                            <EmptyDescription>
                                There are no report types configured yet.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {isLoadingList
                    ? Array.from({ length: 5 }, (_, index) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
                          <Card key={`report-${index}`}>
                              <CardHeader className="gap-2">
                                  <Skeleton className="size-8 rounded-lg" />
                                  <Skeleton className="h-3 w-24" />
                              </CardHeader>
                              <CardContent className="flex flex-1 flex-col justify-end gap-3">
                                  <Skeleton className="h-3 w-full" />
                                  <Skeleton className="h-8 w-full" />
                              </CardContent>
                          </Card>
                      ))
                    : reports.map((entry) => {
                          const { icon: Icon } = reportPresentation(entry.id);
                          const isActive = entry.id === activeId && !isFetching;
                          const isGenerating =
                              entry.id === activeId && isFetching;

                          return (
                              <Card
                                  key={entry.id}
                                  className={cn(
                                      "relative",
                                      isActive && "ring-2 ring-primary",
                                  )}
                              >
                                  <CardHeader>
                                      <div className="flex items-start justify-between gap-2">
                                          <Icon className="size-8 rounded-lg border p-1.5 text-muted-foreground" />
                                          {isActive ? (
                                              <Badge>Active</Badge>
                                          ) : null}
                                      </div>
                                      <CardTitle className="text-xs">
                                          {entry.title}
                                      </CardTitle>
                                  </CardHeader>
                                  <CardContent className="flex flex-1 flex-col justify-end gap-3">
                                      <p className="text-xs text-muted-foreground">
                                          {entry.description}
                                      </p>
                                      <Button
                                          variant={
                                              isActive ? "default" : "outline"
                                          }
                                          size="sm"
                                          className="w-full"
                                          disabled={isFetching}
                                          onClick={() => {
                                              // Re-picking the active report is an explicit
                                              // "regenerate", which a cached query would otherwise
                                              // satisfy without a request.
                                              if (entry.id === activeId)
                                                  refetch();
                                              else setSelectedId(entry.id);
                                          }}
                                      >
                                          {isGenerating ? (
                                              <>
                                                  <Spinner data-icon="inline-start" />
                                                  Generating
                                              </>
                                          ) : isActive ? (
                                              "Regenerate"
                                          ) : (
                                              "Generate"
                                          )}
                                      </Button>
                                  </CardContent>
                              </Card>
                          );
                      })}
            </div>

            {isError ? (
                <DataError
                    error={error}
                    onRetry={() => refetch()}
                    title="Could not generate this report"
                />
            ) : isFetching ? (
                <Card aria-live="polite">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
                        <CardTitle>
                            {reports.find((entry) => entry.id === activeId)
                                ?.title ?? "Report"}
                        </CardTitle>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Spinner />
                            Generating…
                        </span>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/50 text-xs text-muted-foreground">
                            Crunching PO and evaluation data…
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                </Card>
            ) : report ? (
                <ReportResult report={report} />
            ) : null}
        </>
    );
}
