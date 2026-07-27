import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";

import { ItemCreationRequestsView } from "@/components/purchase-requests/item-creation-requests-view";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Item Creation Requests",
};

export default function ItemCreationRequestsPage() {
  return (
    <>
      <Alert>
        <AlertDescription>
          Reached from a link inside Purchase Requests (not a sidebar tab) —
          this only tracks requests created while building a PR, or created
          directly here for master-data cases (new SKUs, materials) that
          aren&apos;t tied to a specific purchase yet.
        </AlertDescription>
      </Alert>

      <PageHeader
        title="Item Creation Requests"
        actions={
          <Button variant="outline" size="sm">
            <PlusIcon data-icon="inline-start" />
            New Item Creation Request
          </Button>
        }
      />

      <ItemCreationRequestsView />
    </>
  );
}
