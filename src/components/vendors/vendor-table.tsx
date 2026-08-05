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
import { formatDate } from "@/lib/date";
import type { Vendor } from "@/modules/vendors";

export function VendorTable({
  vendors,
  page,
  buildPageHref,
}: {
  vendors: Vendor[];
  page: Pagination;
  buildPageHref: (page: number) => string;
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table className={dataTableClass}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Vendor No.</TableHead>
              <TableHead scope="col">Vendor Name</TableHead>
              <TableHead scope="col">Vendor ID</TableHead>
              <TableHead scope="col">Created At</TableHead>
              <TableHead scope="col">Updated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor._id}>
                <TableCell className="font-medium">
                  {vendor.no || "—"}
                </TableCell>
                <TableCell>{vendor.name?.trim() || vendor.no || "—"}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {vendor.vendor_id || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(vendor.created_at) ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(vendor.updated_at) ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <TablePagination
        shown={vendors.length}
        page={page}
        buildPageHref={buildPageHref}
      />
    </Card>
  );
}
