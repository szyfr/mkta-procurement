import { InboxIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CanvassingItemsView } from "@/components/canvassing/canvassing-items-view";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Canvassing",
};

/**
 * The header and the item list are live — they come from the purchase request
 * detail the BFF already serves. Everything below them is hard-coded
 * placeholder copy: quotes, batches and vendor selection have no backend, so
 * the sections stay static rather than being filled with invented data.
 */
export default async function CanvassingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <CanvassingItemsView id={id} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-medium">
              Batch 1 — Steel drum pallets (48in), Stretch wrap film
            </h2>
            <p className="text-xs text-muted-foreground">
              2 items grouped together for shared vendor sourcing
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="neutral">
              4 of 3 minimum quotes received
            </StatusBadge>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href="/canvassing/PR-2026-0113/quotes/new?batch=1" />
              }
            >
              + Add Vendor Quote
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="px-0">
            <RadioGroup
              defaultValue="q-1"
              aria-label="Select winning vendor for batch 1"
              className="block"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="w-8 pl-4">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead scope="col">Vendor</TableHead>
                    <TableHead scope="col">Total Price (All Items)</TableHead>
                    <TableHead scope="col">Delivery Estimate</TableHead>
                    <TableHead scope="col">Quote Date</TableHead>
                    <TableHead scope="col" className="pr-4">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-status-success/10">
                    <TableCell className="pl-4">
                      <RadioGroupItem
                        value="q-1"
                        aria-label="Select Del Rosario Trading"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-status-success">
                      Del Rosario Trading
                    </TableCell>
                    <TableCell className="font-medium text-status-success">
                      ₱18,400.00
                    </TableCell>
                    <TableCell>4 business days</TableCell>
                    <TableCell className="text-muted-foreground">
                      Jul 14
                    </TableCell>
                    <TableCell className="pr-4">
                      <StatusBadge tone="success">Received</StatusBadge>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="pl-4">
                      <RadioGroupItem
                        value="q-2"
                        aria-label="Select Acme Industrial Supply"
                      />
                    </TableCell>
                    <TableCell>Acme Industrial Supply</TableCell>
                    <TableCell>₱19,750.00</TableCell>
                    <TableCell>2 business days</TableCell>
                    <TableCell className="text-muted-foreground">
                      Jul 13
                    </TableCell>
                    <TableCell className="pr-4">
                      <StatusBadge tone="success">Received</StatusBadge>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="pl-4">
                      <RadioGroupItem
                        value="q-3"
                        aria-label="Select Pacific Fasteners Inc."
                      />
                    </TableCell>
                    <TableCell>Pacific Fasteners Inc.</TableCell>
                    <TableCell>₱21,000.00</TableCell>
                    <TableCell>5 business days</TableCell>
                    <TableCell className="text-muted-foreground">
                      Jul 13
                    </TableCell>
                    <TableCell className="pr-4">
                      <StatusBadge tone="success">Received</StatusBadge>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="pl-4">
                      <RadioGroupItem
                        value="q-4"
                        aria-label="Select Metro Lubricants Corp"
                      />
                    </TableCell>
                    <TableCell>Metro Lubricants Corp</TableCell>
                    <TableCell>₱20,100.00</TableCell>
                    <TableCell>3 business days</TableCell>
                    <TableCell className="text-muted-foreground">
                      Jul 14
                    </TableCell>
                    <TableCell className="pr-4">
                      <StatusBadge tone="success">Received</StatusBadge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </RadioGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm">
              Confirm Vendor Selection — Del Rosario Trading
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="font-medium">Batch 2 — Corner edge protectors</h2>
            <p className="text-xs text-muted-foreground">
              Vendor already selected for this item
            </p>
          </div>
          <StatusBadge tone="success">
            Vendor Selected — Pacific Fasteners Inc.
          </StatusBadge>
        </div>

        <Card>
          <CardContent className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Winning Price</p>
              <p>₱9,400.00 · Pacific Fasteners Inc.</p>
            </div>
            <div>
              <p className="text-muted-foreground">Delivery Estimate</p>
              <p>3 business days</p>
            </div>
            <div>
              <p className="text-muted-foreground">Quotes Received</p>
              <p>3 / 3 minimum</p>
            </div>
            <div>
              <p className="text-muted-foreground">Selected On</p>
              <p>Jul 15</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-medium">Batch 3 — Pallet wrap dispenser</h2>
          <p className="text-xs text-muted-foreground">
            1 item for shared vendor sourcing
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <InboxIcon className="size-6 text-muted-foreground" />
            <p className="font-medium text-sm">No quotes yet</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              No quotes have been entered for this batch yet. Add a vendor quote
              to start the comparison.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              nativeButton={false}
              render={
                <Link href="/canvassing/PR-2026-0113/quotes/new?batch=3" />
              }
            >
              + Add Vendor Quote
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
