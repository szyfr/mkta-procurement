import { DownloadIcon } from "lucide-react";
import type { Metadata } from "next";

import { ReportWorkspace } from "@/components/reports/report-workspace";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { departments, vendors } from "@/data/purchase-requests";
import { dateRanges } from "@/data/reports";

export const metadata: Metadata = {
  title: "Reports",
};

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Procurement performance across the selected period"
        actions={
          <Button variant="outline" size="sm">
            <DownloadIcon data-icon="inline-start" />
            Export
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect label="Date Range: Last 90 days" options={dateRanges} />
        <FilterSelect label="Department" options={departments} />
        <FilterSelect label="Vendor" options={vendors} />
      </div>

      <ReportWorkspace />
    </>
  );
}
