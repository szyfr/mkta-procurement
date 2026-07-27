import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PurchaseRequestCard } from "@/components/purchase-requests/pr-card";
import { PurchaseRequestTable } from "@/components/purchase-requests/pr-table";
import {
  type ListView,
  ViewToggle,
} from "@/components/purchase-requests/view-toggle";
import { DataToolbar } from "@/components/shared/data-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusLegend } from "@/components/shared/status-legend";
import { Button } from "@/components/ui/button";
import {
  departments,
  getListedPurchaseRequests,
} from "@/data/purchase-requests";

export const metadata: Metadata = {
  title: "Purchase Requests",
};

const filters = [
  {
    label: "Status",
    options: [
      "Draft",
      "Canvassing",
      "PO Created",
      "Partially Completed",
      "Completed",
      "Rejected",
    ],
  },
  { label: "Priority", options: ["High", "Normal", "Low"] },
  { label: "Department", options: departments },
  { label: "Date", options: ["Last 7 days", "Last 30 days", "Last 90 days"] },
];

export default async function PurchaseRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const activeView: ListView = view === "table" ? "table" : "cards";
  const requests = getListedPurchaseRequests();

  return (
    <>
      <PageHeader
        title="Purchase Requests"
        description="Track every request from draft through delivery"
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/purchase-requests/item-requests" />}
            >
              Item Creation Requests →
            </Button>
            <ViewToggle view={activeView} />
            <Button
              variant="outline"
              render={<Link href="/purchase-requests/new" />}
            >
              <PlusIcon data-icon="inline-start" />
              New Purchase Request
            </Button>
          </>
        }
      />

      <DataToolbar placeholder="Filter requests…" filters={filters} />

      <StatusLegend />

      {activeView === "table" ? (
        <PurchaseRequestTable requests={requests} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => (
            <PurchaseRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </>
  );
}
