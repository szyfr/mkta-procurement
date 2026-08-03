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
import type { Vendor } from "@/modules/vendors";

export function VendorTable({
  vendors,
  page,
  buildPageHref,
}: {
  vendors: Vendor[];
  page: PageInfo;
  buildPageHref: (page: number) => string;
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="pl-4">
                Vendor No.
              </TableHead>
              <TableHead scope="col">Vendor Name</TableHead>
              <TableHead scope="col">Vendor ID</TableHead>
              <TableHead scope="col">Created At</TableHead>
              <TableHead scope="col" className="pr-4">
                Updated At
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="pl-4 font-medium">
                  {vendor.no || "—"}
                </TableCell>
                <TableCell>{vendor.name || "—"}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {vendor.vendorId || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {vendor.createdAt ?? "—"}
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground">
                  {vendor.updatedAt ?? "—"}
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
