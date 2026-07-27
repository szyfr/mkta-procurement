import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { ReportCell, ReportChartDatum } from "@/types/reports";

/**
 * Reports are canned, pre-formatted payloads ("₱948,200", "4.5 / 5"), not
 * computed aggregates, so the chart series and table body are stored verbatim
 * as JSON rather than being modelled as columns.
 *
 * The lucide icon and the `ChartConfig` (which holds CSS custom properties)
 * cannot cross a JSON boundary; they live in the client-side presentation
 * registry at `src/lib/reports/presentation.ts` and are keyed by report id.
 */
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  resultTitle: text("result_title").notNull(),
  summary: text("summary").notNull(),
  /** Suffix appended to tooltip values, e.g. " days". */
  chartUnit: text("chart_unit"),
  chartCurrency: integer("chart_currency", { mode: "boolean" })
    .notNull()
    .default(false),
  chartData: text("chart_data", { mode: "json" })
    .$type<ReportChartDatum[]>()
    .notNull(),
  tableColumns: text("table_columns", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  tableRows: text("table_rows", { mode: "json" })
    .$type<ReportCell[][]>()
    .notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
