"use client";

import { useQuery } from "@tanstack/react-query";
import { FileTextIcon } from "lucide-react";
import * as React from "react";

import { ErrorAlert } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatShortDate } from "@/lib/date";
import { cn, formatCurrency } from "@/lib/utils";
import { quotationDetailQuery } from "@/modules/canvassing";

/**
 * Read-only detail for one quotation. `GET /canvassing/quotations` — what the
 * comparison table renders from — carries no attachments, so this fetches
 * `GET /quotations/{id}` separately, and only once the dialog is open.
 */
export function QuotationDetailDialog({
  quotationId,
  itemId,
  itemName,
}: {
  quotationId: string;
  /** Which row in `item_pricing` is the one this dialog was opened from. */
  itemId: string;
  itemName: string;
}) {
  const [open, setOpen] = React.useState(false);

  const { data, isPending, isError, error } = useQuery({
    ...quotationDetailQuery(quotationId),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        View
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quotation {data?.reference_no ?? ""}</DialogTitle>
        </DialogHeader>

        {isError ? (
          <ErrorAlert title="Couldn't load this quotation" error={error} />
        ) : isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-sm">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <dt className="text-xs text-muted-foreground">Reference No.</dt>
                <dd>{data.reference_no}</dd>
              </div>
              <div>
                {/* No vendor join upstream — the id stands in for the name. */}
                <dt className="text-xs text-muted-foreground">Vendor ID</dt>
                <dd className="font-mono text-xs">{data.vendor_id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Quote Date</dt>
                <dd>{formatShortDate(data.date) ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Delivery Date</dt>
                <dd>{formatShortDate(data.delivery_date) ?? "—"}</dd>
              </div>
              <div>
                {/* Payment terms have their own module, but nothing here resolves this id to it. */}
                <dt className="text-xs text-muted-foreground">
                  Payment Term ID
                </dt>
                <dd className="font-mono text-xs">{data.payment_term_id}</dd>
              </div>
            </dl>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Items Priced
              </span>
              <ul className="flex flex-col divide-y rounded-md border">
                {data.item_pricing.map((pricing) => (
                  <li
                    key={pricing.item_id}
                    className={cn(
                      "flex items-center justify-between px-3 py-2",
                      pricing.item_id === itemId && "bg-accent",
                    )}
                  >
                    <span className="font-mono text-xs">
                      {pricing.item_id === itemId ? itemName : pricing.item_id}
                    </span>
                    <span>{formatCurrency(pricing.unit_price, true)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Attachments</span>
              {data.documents.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No files were attached to this quote.
                </p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {data.documents.map((document) => (
                    <li key={document._id}>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-xs text-primary hover:underline"
                      >
                        <FileTextIcon
                          data-icon="inline-start"
                          className="size-3.5"
                        />
                        {document.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
