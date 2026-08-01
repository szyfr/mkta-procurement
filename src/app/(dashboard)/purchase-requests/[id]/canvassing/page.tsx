import { InboxIcon } from "lucide-react";
import type { Metadata } from "next";

import { PurchaseRequestCanvassingView } from "@/components/canvassing/pr-canvassing-view";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * The request is fetched in the browser, so the title can't reflect it — same
 * reason the detail page carries a static one.
 */
export const metadata: Metadata = {
  title: "Canvassing",
};

export default async function CanvassingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <PurchaseRequestCanvassingView id={id} />

      {/* Quotations and vendor selection have no endpoint the UI can read yet
          (`GET /canvassing/quotations` returns them per quotation, not per
          request), so this stands in for the comparison section rather than
          the page ending at the item list. */}
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No vendor quotes yet</EmptyTitle>
              <EmptyDescription>
                Quotes for this request will be compared here once quotations
                are wired up. Select items above to start a quotation.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </>
  );
}
