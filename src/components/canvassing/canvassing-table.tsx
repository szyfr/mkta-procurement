import Link from "next/link";

import { StatusBadge } from "@/components/shared/status-badge";
import { dataTableClass } from "@/components/shared/table-classes";
import { TablePagination } from "@/components/shared/table-pagination";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PageInfo } from "@/lib/api/pagination";
import { cn } from "@/lib/utils";
import type { CanvassingEntry } from "@/modules/canvassing";

/** Columns the endpoint has no source for, so every row shows them empty. */
const NO_BACKEND_SOURCE = "—";

/**
 * Runs of rows from the same request alternate a tint, so a request with
 * several canvassed items reads as one group rather than as unrelated rows.
 * The backend sorts by `created_at`, and a request's items are created
 * together, so they arrive adjacent in practice.
 */
function tintedRows(entries: CanvassingEntry[]) {
  let group = 0;

  return entries.map((entry, index) => {
    const previous = entries[index - 1];

    if (previous && previous.purchaseRequestId !== entry.purchaseRequestId) {
      group += 1;
    }

    return group % 2 === 1;
  });
}

export function CanvassingTable({
  entries,
  page,
  buildPageHref,
}: {
  entries: CanvassingEntry[];
  page: PageInfo;
  buildPageHref: (page: number) => string;
}) {
  const tinted = tintedRows(entries);

  return (
    <Card>
      <CardContent className="px-0">
        <Table className={dataTableClass}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">PR Reference</TableHead>
              <TableHead scope="col">Item</TableHead>
              <TableHead scope="col">Department</TableHead>
              <TableHead scope="col">Quotes Received</TableHead>
              <TableHead scope="col">Status</TableHead>
              <TableHead scope="col">Initiated</TableHead>
              <TableHead scope="col">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow
                key={entry.id}
                className={cn(tinted[index] && "bg-muted/40")}
              >
                <TableCell>
                  <Link
                    href={`/purchase-requests/${entry.purchaseRequestId}`}
                    className="font-mono text-xs hover:underline"
                  >
                    {entry.purchaseRequestNo}
                  </Link>
                </TableCell>
                <TableCell>{entry.item}</TableCell>
                {/* Department and quote counts: the list pipeline projects
                    awards and quotations away and joins neither the request
                    nor its department, so there is nothing to show. */}
                <TableCell className="text-muted-foreground">
                  {NO_BACKEND_SOURCE}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {NO_BACKEND_SOURCE}
                </TableCell>
                <TableCell>
                  <StatusBadge tone={entry.statusTone}>
                    {entry.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.initiatedOn ?? NO_BACKEND_SOURCE}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/purchase-requests/${entry.purchaseRequestId}/canvassing`}
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
      <TablePagination
        shown={entries.length}
        page={page}
        buildPageHref={buildPageHref}
      />
    </Card>
  );
}
