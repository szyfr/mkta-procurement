import { DownloadIcon } from "lucide-react";
import type { Metadata } from "next";

import { ReportsView } from "@/components/reports/reports-view";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

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

      <ReportsView />
    </>
  );
}
