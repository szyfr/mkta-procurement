import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  dataTableClass,
  numericCellClass,
} from "@/components/shared/table-classes";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  type PurchaseRequestDetail,
  purchaseRequestItemStatusLabels,
  purchaseRequestItemTone,
} from "@/modules/purchase-requests";

/** Per-item sourcing status, with the follow-up action for each row. */
export function PurchaseRequestItemsTable({
  request,
}: {
  request: PurchaseRequestDetail;
}) {
  return (
    <Table className={dataTableClass}>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Item</TableHead>
          <TableHead scope="col" className={numericCellClass}>
            Qty
          </TableHead>
          <TableHead scope="col">Vendor</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {request.items.map((item) => (
          <TableRow
            key={item._id}
            className={cn(
              item.status === "completed" && "bg-status-success-subtle",
            )}
          >
            {/* The detail pipeline joins the material; the raw id stands in
                if the lookup missed. */}
            <TableCell>
              {item.material?.description || item.material_id}
            </TableCell>
            <TableCell className={numericCellClass}>{item.quantity}</TableCell>
            <TableCell>
              {/* The backend joins no vendor, so the id is the only label. */}
              {item.vendor_id || (
                <span className="text-muted-foreground italic">
                  {item.is_needs_canvass ? "Empty — in canvassing" : "Not set"}
                </span>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge tone={purchaseRequestItemTone[item.status]}>
                {purchaseRequestItemStatusLabels[item.status]}
              </StatusBadge>
            </TableCell>
            <TableCell>
              {item.status === "po-created" ? (
                <Button variant="outline" size="sm">
                  Add Proof of Order &amp; Confirm Delivery
                </Button>
              ) : item.status === "completed" ? (
                <span className="text-xs text-muted-foreground">
                  Proof on file
                </span>
              ) : item.status === "canvassing" ? (
                <Link
                  href={`/purchase-requests/${request._id}/canvassing`}
                  className="text-xs text-muted-foreground hover:underline flex gap-1 items-center"
                >
                  View Canvassing
                  <ArrowRightIcon className="size-3.5" aria-hidden />
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
