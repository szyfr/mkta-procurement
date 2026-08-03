import { InboxIcon } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { ItemQuotations } from "@/modules/canvassing";

/** Columns the endpoint has no source for, so every row shows them empty. */
const NO_VALUE = "—";

/**
 * Vendor quotes for one purchase request item.
 *
 * The cheapest quote is highlighted, not the winning one: `canvass_awards` has
 * no read endpoint, so which vendor was actually chosen is unknowable here.
 * That is also why there is no "confirm selection" action.
 */
function lowestQuoteId(group: ItemQuotations) {
  // Seeded reduce — an item can exist with nothing quoted against it, and an
  // unpriced quote can't be the cheapest.
  return group.quotes.reduce<{ id: string; unitPrice: number } | null>(
    (cheapest, quote) =>
      quote.unitPrice !== null &&
      (cheapest === null || quote.unitPrice < cheapest.unitPrice)
        ? { id: quote.id, unitPrice: quote.unitPrice }
        : cheapest,
    null,
  )?.id;
}

export function ItemQuotationsSection({ group }: { group: ItemQuotations }) {
  const lowestId = lowestQuoteId(group);
  const quantity = group.unit
    ? `${group.quantity} ${group.unit}`
    : `${group.quantity}`;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium">{group.item}</h2>
          <p className="text-xs text-muted-foreground">
            {quantity} requested · quotes are compared per item, so each can go
            to a different vendor
          </p>
        </div>
        <StatusBadge tone={group.quotes.length === 0 ? "info" : "neutral"}>
          {group.quotes.length} {group.quotes.length === 1 ? "quote" : "quotes"}{" "}
          received
        </StatusBadge>
      </div>

      <Card>
        {group.quotes.length === 0 ? (
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>No quotes yet</EmptyTitle>
                <EmptyDescription>
                  No vendor has quoted this item yet. Once quotations are
                  recorded they appear here for comparison.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        ) : (
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col" className="pl-4">
                    Vendor
                  </TableHead>
                  <TableHead scope="col">Unit Price</TableHead>
                  <TableHead scope="col">Line Total</TableHead>
                  <TableHead scope="col">Delivery Date</TableHead>
                  <TableHead scope="col">Quote Date</TableHead>
                  <TableHead scope="col" className="pr-4">
                    Reference
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.quotes.map((quote) => {
                  const isLowest = quote.id === lowestId;

                  return (
                    <TableRow
                      key={quote.id}
                      className={cn(isLowest && "bg-status-success/5")}
                    >
                      {/* The id is all the endpoint gives; it shows raw, the
                          way the list's PR Reference did before that join
                          landed. */}
                      <TableCell
                        className={cn(
                          "pl-4 font-mono text-xs",
                          isLowest && "font-medium text-status-success",
                        )}
                      >
                        {quote.vendorId ?? NO_VALUE}
                      </TableCell>
                      <TableCell
                        className={cn(
                          isLowest && "font-medium text-status-success",
                        )}
                      >
                        {quote.unitPrice === null
                          ? NO_VALUE
                          : formatCurrency(quote.unitPrice, true)}
                      </TableCell>
                      <TableCell>
                        {quote.lineTotal === null
                          ? NO_VALUE
                          : formatCurrency(quote.lineTotal, true)}
                      </TableCell>
                      <TableCell>{quote.deliveryDate ?? NO_VALUE}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {quote.quoteDate ?? NO_VALUE}
                      </TableCell>
                      <TableCell className="pr-4 text-muted-foreground">
                        {quote.referenceNo ?? NO_VALUE}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </section>
  );
}
