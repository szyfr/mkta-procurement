import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Shown only while an item on the request is routed to canvassing and
 * waiting on vendor quotes — the one cross-screen action the detail page
 * currently surfaces.
 */
export function PurchaseRequestActionPanel({
  purchaseRequestId,
}: {
  purchaseRequestId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Action Panel</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Items on this request are routed to canvassing and are waiting on
          vendor quotes.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          render={
            <Link href={`/purchase-requests/${purchaseRequestId}/canvassing`} />
          }
          nativeButton={false}
        >
          View Canvassing
        </Button>
      </CardContent>
    </Card>
  );
}
