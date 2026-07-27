import type { ReportCell, ReportChartDatum } from "@/types";

/**
 * Seed fixtures for the canned reports. Read only by `src/db/seed.ts`.
 *
 * The lucide icon and the chart's `ChartConfig` are deliberately absent: they
 * cannot cross a JSON boundary, so they live in
 * `@/lib/reports/presentation.ts` and are looked up by report id on the client.
 */
export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
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

export const reports: ReportDefinition[] = [
  {
    id: "pr-cycle-time",
    title: "PR Cycle Time",
    description: "Avg. days from submission to PO",
    resultTitle: "PR Cycle Time — Last 90 Days",
    summary: "Avg. overall: 5.6 days",
    chart: {
      data: [
        { category: "Canvassing", value: 3.1 },
        { category: "PO Creation", value: 0.4 },
        { category: "Delivery", value: 2.1 },
      ],
      unit: " days",
    },
    table: {
      columns: ["Stage", "Avg. Days", "Slowest Department", "Trend"],
      rows: [
        ["Canvassing", "3.1", "Production", { value: "↑ 0.6", tone: "danger" }],
        [
          "PO Creation",
          "0.4",
          "Maintenance",
          { value: "↓ 0.1", tone: "success" },
        ],
        ["Delivery", "2.1", "Facilities", { value: "— 0.0", tone: "muted" }],
      ],
    },
  },
  {
    id: "spend-by-department",
    title: "Spend by Department",
    description: "PO amounts grouped by department",
    resultTitle: "Spend by Department — Last 90 Days",
    summary: "Total: ₱2,184,600",
    chart: {
      data: [
        { category: "Production", value: 948200 },
        { category: "Maintenance", value: 612000 },
        { category: "Facilities", value: 398700 },
        { category: "Quality", value: 156400 },
        { category: "IT", value: 69300 },
      ],
      currency: true,
    },
    table: {
      columns: ["Department", "POs Issued", "Total Spend", "Avg. Cycle Time"],
      rows: [
        ["Production", "42", "₱948,200", "6.2 days"],
        ["Maintenance", "31", "₱612,000", "4.8 days"],
        ["Facilities", "18", "₱398,700", "5.5 days"],
        ["Quality", "9", "₱156,400", "7.1 days"],
        ["IT", "5", "₱69,300", "3.9 days"],
      ],
    },
  },
  {
    id: "vendor-performance",
    title: "Vendor Performance",
    description:
      "Auto-scored from delivery & quality data — replaces manual vendor evaluations",
    resultTitle: "Vendor Performance — Last 90 Days",
    summary: "12 vendors evaluated",
    chart: {
      data: [
        { category: "Metro Lub.", value: 4.5 },
        { category: "Acme", value: 4.1 },
        { category: "Del Rosario", value: 3.6 },
        { category: "Others (avg)", value: 3.9 },
      ],
      unit: " / 5",
    },
    table: {
      columns: ["Vendor", "Avg. Rating", "On-Time Delivery", "POs Fulfilled"],
      rows: [
        ["Metro Lubricants Corp", "4.5 / 5", "96%", "14"],
        ["Acme Industrial Supply", "4.1 / 5", "91%", "21"],
        ["Del Rosario Trading", "3.6 / 5", "78%", "9"],
        ["Others (avg. of 9)", "3.9 / 5", "85%", "33"],
      ],
    },
  },
  {
    id: "purchaser-performance",
    title: "Purchaser Performance",
    description:
      "PRs processed, cycle time, and compliance per procurement officer",
    resultTitle: "Purchaser Performance — Last 90 Days",
    summary: "3 procurement officers",
    chart: {
      data: [
        { category: "S. Galvis", value: 47 },
        { category: "P. Ocampo", value: 38 },
        { category: "L. Bautista", value: 25 },
      ],
    },
    table: {
      columns: [
        "Purchaser",
        "PRs Processed",
        "Avg. Cycle Time",
        "Canvassing Compliance",
      ],
      rows: [
        ["S. Galvis (you)", "47", "5.1 days", "94%"],
        ["P. Ocampo", "38", "6.4 days", "87%"],
        ["L. Bautista", "25", "7.2 days", "81%"],
      ],
    },
  },
  {
    id: "canvassing-compliance",
    title: "Canvassing Compliance",
    description: "PRs meeting the 3-quote minimum",
    resultTitle: "Canvassing Compliance — Last 90 Days",
    summary: "88% met the 3-quote minimum",
    chart: {
      // The only report the wireframe colours: outcome quality, not category.
      data: [
        {
          category: "Met Minimum",
          value: 45,
          fill: "var(--status-success)",
        },
        { category: "Exempted", value: 6, fill: "var(--status-warning)" },
        { category: "Below Minimum", value: 1, fill: "var(--status-danger)" },
      ],
    },
    table: {
      columns: ["Department", "PRs Canvassed", "Met Minimum", "Exempted"],
      rows: [
        ["Production", "22", "20", "2"],
        ["Maintenance", "15", "12", "3"],
        ["Facilities", "9", "9", "0"],
        ["Quality", "6", "4", "1"],
      ],
    },
  },
];
