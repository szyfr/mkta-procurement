import { SearchXIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DataToolbar } from "@/components/shared/data-toolbar";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
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
import {
  canvassingCases,
  canvassingListNote,
  canvassingTone,
} from "@/data/canvassing";
import { departments } from "@/data/purchase-requests";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Canvassing",
};

const filters = [
  {
    label: "Status",
    options: [
      "Awaiting Quotes",
      "Comparison Ready",
      "Vendor Selected",
      "Pending Exemption Approval",
    ],
  },
  { label: "Department", options: departments },
];

export default function CanvassingPage() {
  const cases = canvassingCases;

  return (
    <>
      <PageHeader
        title="Canvassing"
        description="Items out for vendor quotation, grouped into batches"
      />

      <DataToolbar placeholder="Filter canvassing…" filters={filters} />

      {cases.length === 0 ? (
        <Card>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>No canvassing in progress</EmptyTitle>
                <EmptyDescription>
                  Canvassing cases appear here once a Purchase Request reaches
                  the sourcing stage. There&apos;s nothing awaiting vendor
                  quotes right now.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href="/purchase-requests" />}
                  nativeButton={false}
                >
                  View Purchase Requests Awaiting Canvassing
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="pl-4">
                      PR Reference
                    </TableHead>
                    <TableHead scope="col">Item</TableHead>
                    <TableHead scope="col">Batch</TableHead>
                    <TableHead scope="col">Department</TableHead>
                    <TableHead scope="col">Quotes Received</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Initiated</TableHead>
                    <TableHead scope="col" className="pr-4">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((entry) => (
                    <TableRow
                      key={entry.id}
                      // Rows from the same PR share a tint so multi-batch
                      // requests read as one group.
                      className={cn(
                        entry.purchaseRequestId === "PR-2026-0113" &&
                          entry.batch === 1 &&
                          "bg-muted/40",
                      )}
                    >
                      <TableCell className="pl-4 font-medium">
                        <Link
                          href={`/purchase-requests/${entry.purchaseRequestId}`}
                          className="hover:underline"
                        >
                          {entry.purchaseRequestId}
                        </Link>
                      </TableCell>
                      <TableCell>{entry.item}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            entry.batch > 1 &&
                              "border-status-ordered/30 bg-status-ordered/10 text-status-ordered",
                          )}
                        >
                          Batch {entry.batch}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.department}</TableCell>
                      <TableCell>
                        {entry.quotesReceived} / {entry.quotesRequired}{" "}
                        {entry.exempted ? "(exempted)" : "minimum"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={canvassingTone[entry.status]}>
                          {entry.statusLabel}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.initiatedOn}
                      </TableCell>
                      <TableCell className="pr-4">
                        <Link
                          href={`/canvassing/${entry.purchaseRequestId}`}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Open →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">{canvassingListNote}</p>
        </>
      )}
    </>
  );
}
