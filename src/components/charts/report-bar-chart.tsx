"use client";

import { Bar, BarChart, Cell, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ReportChartDatum } from "@/data/reports";
import { formatCurrency } from "@/lib/utils";

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
