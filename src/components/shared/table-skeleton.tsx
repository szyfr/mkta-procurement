import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/** Cycled widths so placeholder cells read as ragged text, not a solid block. */
const cellWidths = ["w-28", "w-20", "w-32", "w-16", "w-24", "w-36"];

/** Deterministic pick — the same cell is the same width on the server and client. */
function cellWidth(row: number, column: number) {
  return cellWidths[(row * 3 + column * 2) % cellWidths.length];
}

/**
 * Placeholder shown while a list card is loading. It mirrors the table it
 * stands in for — header, rows, pagination footer — so nothing shifts once the
 * real rows land.
 */
export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  /** Match the loading table's column count to keep the layout stable. */
  columns?: number;
}) {
  return (
    <Card aria-busy="true">
      {/* Absolutely positioned by `sr-only`, so it announces without taking space. */}
      <output className="sr-only">Loading table…</output>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: columns }, (_, column) => (
                <TableHead
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder columns
                  key={column}
                  className={cn(
                    column === 0 && "pl-4",
                    column === columns - 1 && "pr-4",
                  )}
                >
                  <Skeleton
                    className={cn("h-3", column % 2 === 0 ? "w-20" : "w-16")}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }, (_, row) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder rows
              <TableRow key={row} className="hover:bg-transparent">
                {Array.from({ length: columns }, (_, column) => (
                  <TableCell
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder columns
                    key={column}
                    className={cn(
                      "py-3",
                      column === 0 && "pl-4",
                      column === columns - 1 && "pr-4",
                    )}
                  >
                    <Skeleton
                      className={cn("h-4", cellWidth(row, column))}
                      // Rows fade in sequence, which reads as loading rather
                      // than as one block flashing.
                      style={{ animationDelay: `${row * 90}ms` }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <Skeleton className="h-3 w-28" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-9 rounded-lg" />
          <Skeleton className="h-8 w-9 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </CardFooter>
    </Card>
  );
}
