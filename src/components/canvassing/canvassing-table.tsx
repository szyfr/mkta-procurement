import { ArrowRightIcon } from "lucide-react";
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
import type { Pagination } from "@/lib/api/pagination";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  type CanvassingEntry,
  canvassingStatusTone,
} from "@/modules/canvassing";

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

    if (
      previous &&
      previous.purchase_request_id !== entry.purchase_request_id
    ) {
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
  page: Pagination;
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
                key={entry._id}
                className={cn(tinted[index] && "bg-accent")}
              >
                <TableCell>
                  <Link
                    href={`/purchase-requests/${entry.purchase_request_id}`}
                    className="font-mono text-xs hover:underline"
                  >
                    {/* The pipeline preserves rows whose request lookup found
                        nothing — the raw id still identifies such a row. */}
                    {entry.purchase_request?.no?.trim() ||
                      entry.purchase_request_id}
                  </Link>
                </TableCell>
                {/* Same for the material join. */}
                <TableCell>
                  {entry.material?.description?.trim() || entry.material_id}
                </TableCell>
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
                  {/* The status set is derived in a Mongo pipeline rather than
                      declared as an enum, so a new stage can appear without a
                      schema change; an unrecognized one still renders as a
                      legible neutral pill. */}
                  <StatusBadge
                    tone={canvassingStatusTone[entry.status] ?? "neutral"}
                  >
                    {entry.status}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatShortDate(entry.created_at) ?? NO_BACKEND_SOURCE}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/purchase-requests/${entry.purchase_request_id}/canvassing`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Open
                    <ArrowRightIcon className="size-3.5" aria-hidden />
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
