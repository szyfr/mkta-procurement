import {
    ClipboardCheckIcon,
    GaugeIcon,
    type LucideIcon,
    StarIcon,
    TimerIcon,
    UserCheckIcon,
} from "lucide-react";

import type { ChartConfig } from "@/components/ui/chart";

/**
 * The half of a report that cannot cross a JSON boundary.
 *
 * A lucide icon is a React component and a `ChartConfig` holds CSS custom
 * properties (`var(--chart-2)`), so neither can be serialized by the API. They
 * are keyed by report id and resolved on the client; the endpoint returns only
 * the data.
 */

interface ReportPresentation {
    icon: LucideIcon;
    chartConfig: ChartConfig;
}

const DEFAULT_CHART_CONFIG: ChartConfig = {
    value: { label: "Value", color: "var(--chart-2)" },
};

const PRESENTATION: Record<string, ReportPresentation> = {
    "pr-cycle-time": {
        icon: TimerIcon,
        chartConfig: { value: { label: "Avg. days", color: "var(--chart-2)" } },
    },
    "spend-by-department": {
        icon: GaugeIcon,
        chartConfig: {
            value: { label: "Total spend", color: "var(--chart-2)" },
        },
    },
    "vendor-performance": {
        icon: StarIcon,
        chartConfig: {
            value: { label: "Avg. rating", color: "var(--chart-2)" },
        },
    },
    "purchaser-performance": {
        icon: UserCheckIcon,
        chartConfig: {
            value: { label: "PRs processed", color: "var(--chart-2)" },
        },
    },
    "canvassing-compliance": {
        icon: ClipboardCheckIcon,
        chartConfig: { value: { label: "PRs", color: "var(--chart-2)" } },
    },
};

/** Falls back gracefully so a report added server-side still renders. */
export function reportPresentation(id: string): ReportPresentation {
    return (
        PRESENTATION[id] ?? {
            icon: GaugeIcon,
            chartConfig: DEFAULT_CHART_CONFIG,
        }
    );
}

/** The report shown as already generated when the page loads. */
export const defaultReportId = "spend-by-department";

export const dateRanges = [
    "Last 7 days",
    "Last 30 days",
    "Last 90 days",
    "Year to date",
];
