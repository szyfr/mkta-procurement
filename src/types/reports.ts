/**
 * The serializable half of a report. The lucide icon and the `ChartConfig`
 * (which holds CSS custom properties like `var(--chart-2)`) are presentation
 * and stay on the client — see `src/lib/reports/presentation.ts`.
 */

export interface ReportChartDatum {
    category: string;
    value: number;
    /** Per-bar colour. Omit for the default monochrome treatment. */
    fill?: string;
}

/** A table cell, optionally tinted (used for trend deltas). */
export type ReportCell =
    | string
    | { value: string; tone: "success" | "danger" | "muted" };

/** Listed on the report picker — no chart or table payload. */
export interface ReportSummary {
    id: string;
    title: string;
    description: string;
}

export interface ReportData extends ReportSummary {
    /** Heading of the generated result panel. */
    resultTitle: string;
    /** Right-aligned summary beside the result heading. */
    summary: string;
    chart: {
        data: ReportChartDatum[];
        /** Suffix appended to tooltip values, e.g. " days". */
        unit?: string;
        /** Formats tooltip values as pesos. */
        currency?: boolean;
    };
    table: {
        columns: string[];
        rows: ReportCell[][];
    };
}

export interface ReportFilters {
    dateRange?: string;
    department?: string;
    vendor?: string;
}
