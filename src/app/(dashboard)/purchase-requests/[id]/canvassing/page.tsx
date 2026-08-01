import { InboxIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  title: "Canvassing — PR-2026-0113",
};

/**
 * Static layout only. Every value on this page is hard-coded placeholder copy —
 * the route ignores its `id` param and reads no data source. Swap the markup
 * for real components once the canvassing endpoints exist.
 */
export default function CanvassingDetailPage() {
  return (
    <>
      <PageHeader
        title="Canvassing — PR-2026-0113"
        description="Warehouse · 4 items · not all items need to go to the same vendor"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
          <CardTitle>Items in this Purchase Request</CardTitle>
          <span className="text-xs text-muted-foreground">
            Select items to send out for quotation together
          </span>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="w-8 pl-4">
                  <span className="sr-only">Select</span>
                </TableHead>
                <TableHead scope="col">Item</TableHead>
                <TableHead scope="col">Qty</TableHead>
                <TableHead scope="col">Batch</TableHead>
                <TableHead scope="col" className="pr-4">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-status-info/5">
                <TableCell className="pl-4">
                  <Checkbox
                    defaultChecked
                    aria-label="Select Steel drum pallets (48in)"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  Steel drum pallets (48in)
                </TableCell>
                <TableCell>6</TableCell>
                <TableCell>
                  <Badge variant="outline">Batch 1</Badge>
                </TableCell>
                <TableCell className="pr-4">
                  <StatusBadge tone="neutral">Comparison Ready</StatusBadge>
                </TableCell>
              </TableRow>

              <TableRow className="bg-status-info/5">
                <TableCell className="pl-4">
                  <Checkbox
                    defaultChecked
                    aria-label="Select Stretch wrap film"
                  />
                </TableCell>
                <TableCell className="font-medium">Stretch wrap film</TableCell>
                <TableCell>40</TableCell>
                <TableCell>
                  <Badge variant="outline">Batch 1</Badge>
                </TableCell>
                <TableCell className="pr-4">
                  <StatusBadge tone="neutral">Comparison Ready</StatusBadge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="pl-4">
                  <Checkbox aria-label="Select Corner edge protectors" />
                </TableCell>
                <TableCell className="font-medium">
                  Corner edge protectors
                </TableCell>
                <TableCell>200</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-status-ordered/30 bg-status-ordered/10 text-status-ordered"
                  >
                    Batch 2
                  </Badge>
                </TableCell>
                <TableCell className="pr-4">
                  <StatusBadge tone="success">Vendor Selected</StatusBadge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="pl-4">
                  <Checkbox aria-label="Select Pallet wrap dispenser (handheld)" />
                </TableCell>
                <TableCell className="font-medium">
                  Pallet wrap dispenser (handheld)
                </TableCell>
                <TableCell>3</TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    Not assigned
                  </span>
                </TableCell>
                <TableCell className="pr-4">
                  <StatusBadge tone="neutral">
                    Awaiting Batch Assignment
                  </StatusBadge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            2 items selected — not yet grouped into an active batch
          </span>
          <Button
            size="sm"
            render={<Link href="/canvassing/PR-2026-0113/quotes/new" />}
            nativeButton={false}
          >
            Create Quotation for Selected Items →
          </Button>
        </CardFooter>
      </Card>

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
