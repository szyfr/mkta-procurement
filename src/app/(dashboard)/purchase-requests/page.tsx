import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PurchaseRequestListView } from "@/components/purchase-requests/pr-list-view";
import {
  type ListView,
  ViewToggle,
} from "@/components/purchase-requests/view-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Purchase Requests",
};

/**
 * Thin server shell: it owns the page metadata and reads the URL state, then
 * hands off to the client view that fetches from the BFF.
 */
export default async function PurchaseRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    page?: string;
    search?: string;
    priority?: string;
    departments?: string;
  }>;
}) {
  const { view, page, search, priority, departments } = await searchParams;
  const activeView: ListView = view === "table" ? "table" : "cards";
  const activePage = Math.max(Number(page) || 1, 1);

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
              nativeButton={false}
            >
              Item Creation Requests →
            </Button>
            <ViewToggle view={activeView} />
            <Button
              variant="outline"
              render={<Link href="/purchase-requests/new" />}
              nativeButton={false}
            >
              <PlusIcon data-icon="inline-start" />
              New Purchase Request
            </Button>
          </>
        }
      />

      <PurchaseRequestListView
        view={activeView}
        page={activePage}
        search={search ?? ""}
        priority={priority ?? ""}
        departments={departments ?? ""}
      />
    </>
  );
}
