import { PackageSearchIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = {
  title: "Item Creation Requests",
};

/**
 * Item Creation Requests have no backend yet — FastAPI has no controller,
 * model, or collection for them. The page keeps its place in the navigation
 * and states the gap plainly instead of showing invented rows.
 */
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
          <Button variant="outline" size="sm" disabled>
            <PlusIcon data-icon="inline-start" />
            New Item Creation Request
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PackageSearchIcon />
              </EmptyMedia>
              <EmptyTitle>Not available yet</EmptyTitle>
              <EmptyDescription>
                The purchasing service doesn&apos;t store item creation requests
                yet. This page will list them as soon as the endpoint exists.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </>
  );
}
