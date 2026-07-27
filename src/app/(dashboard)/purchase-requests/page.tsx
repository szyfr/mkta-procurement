import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PurchaseRequestsView } from "@/components/purchase-requests/purchase-requests-view";
import {
  type ListView,
  ViewToggle,
} from "@/components/purchase-requests/view-toggle";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Purchase Requests",
};

export default async function PurchaseRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const activeView: ListView = view === "table" ? "table" : "cards";

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

      <PurchaseRequestsView view={activeView} />
    </>
  );
}
