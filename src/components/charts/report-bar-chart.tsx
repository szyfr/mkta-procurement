"use client";

import { Bar, BarChart, Cell, XAxis } from "recharts";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import type { ReportChartDatum } from "@/types";

/**
 * Generic vertical bar chart for the report panels. Stays agnostic of any one
 * report — pass a dataset and config and it renders, so swapping mock data for
 * an API response needs no change here.
 *
 * Data points may carry their own `fill` (used by Canvassing Compliance, the
 * one report where bar colour is meaningful); otherwise all bars share the
 * config colour.
 */
export function ReportBarChart({
    data,
    config,
    dataKey = "value",
    categoryKey = "category",
    unit,
    currency,
    className,
}: {
    data: ReportChartDatum[];
    config: ChartConfig;
    dataKey?: string;
    categoryKey?: string;
    unit?: string;
    currency?: boolean;
    className?: string;
}) {
    const hasPerBarColours = data.some((entry) => entry.fill);

    return (
        <ChartContainer
            config={config}
            className={className ?? "aspect-auto h-56 w-full"}
        >
            <BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
                <XAxis
                    dataKey={categoryKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            formatter={(value) => {
                                const numeric = Number(value);
                                return currency
                                    ? formatCurrency(numeric)
                                    : `${numeric}${unit ?? ""}`;
                            }}
                        />
                    }
                />
                <Bar
                    dataKey={dataKey}
                    radius={4}
                    // Keeps bars close to the wireframe's narrow columns instead of
                    // stretching to fill the container.
                    maxBarSize={48}
                    fill={`var(--color-${dataKey})`}
                    // The grow-in animation starts when the chart mounts. Now that the
                    // report arrives from a query, the chart mounts into a container that
                    // has just been resized, and the animation reliably stalls on its
                    // first frame — leaving flat bars until some unrelated re-render
                    // knocks it loose. The report panel does not need the flourish.
                    isAnimationActive={false}
                >
                    {hasPerBarColours
                        ? data.map((entry) => (
                              <Cell key={entry.category} fill={entry.fill} />
                          ))
                        : null}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
