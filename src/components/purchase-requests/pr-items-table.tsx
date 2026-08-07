import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { StatusBadge, StatusDot } from "@/components/shared/status-badge";
import {
  dataTableClass,
  numericCellClass,
} from "@/components/shared/table-classes";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  type PurchaseRequestDetail,
  type PurchaseRequestItem,
  purchaseRequestItemStatusLabels,
  purchaseRequestItemTone,
} from "@/modules/purchase-requests";

/**
 * The only status a proof of order can still be added for. Exported because
 * the section above owns the selection and must apply the same rule — a
 * refetch that moves an item past `po-created` has to drop it from both the
 * checkbox column and the selection.
 */
export function isProofSelectable(item: PurchaseRequestItem) {
  return item.status === "po-created";
}

/**
 * The proof record joined onto the request that covers this item, if any —
 * `POST /purchase-request-proofs` never echoes a filename back (only
 * `GET /purchase-request-proofs/{id}` does, which this app doesn't call), so
 * there's nothing to display beyond that a proof exists.
 */
function resolveProof(
  item: PurchaseRequestItem,
  request: PurchaseRequestDetail,
) {
  return request.proofs.find((proof) =>
    proof.purchase_request_item_ids.includes(item._id),
  );
}

/** Per-item sourcing status, plus proof-of-order state where one has been recorded. */
export function PurchaseRequestItemsTable({
  request,
  selectedIds,
  onToggleItem,
  onToggleAll,
}: {
  request: PurchaseRequestDetail;
  selectedIds: Set<string>;
  onToggleItem: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}) {
  const selectableItems = request.items.filter(isProofSelectable);
  const allSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selectedIds.has(item._id));
  const someSelected = selectableItems.some((item) =>
    selectedIds.has(item._id),
  );

  return (
    <Table className={dataTableClass}>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" className="w-9">
            {selectableItems.length > 0 ? (
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Select all items awaiting proof"
              />
            ) : null}
          </TableHead>
          <TableHead scope="col">Item</TableHead>
          <TableHead scope="col" className={numericCellClass}>
            Qty
          </TableHead>
          <TableHead scope="col">Vendor</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Proof of order</TableHead>
          <TableHead scope="col">Delivery</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {request.items.map((item) => {
          const selectable = isProofSelectable(item);
          const proof = resolveProof(item, request);

          return (
            <TableRow
              key={item._id}
              className={cn(
                item.status === "completed" && "bg-status-success-subtle",
                selectedIds.has(item._id) && "bg-accent",
              )}
            >
              <TableCell>
                {selectable ? (
                  <Checkbox
                    checked={selectedIds.has(item._id)}
                    onCheckedChange={(checked) =>
                      onToggleItem(item._id, checked === true)
                    }
                    aria-label={`Select ${item.material?.description || item.material_id}`}
                  />
                ) : null}
              </TableCell>
              {/* The detail pipeline joins the material; the raw id stands in
                  if the lookup missed. */}
              <TableCell>
                {item.material?.description || item.material_id}
              </TableCell>
              <TableCell className={numericCellClass}>
                {item.quantity}
              </TableCell>
              <TableCell>
                {/* The backend joins no vendor, so the id is the only label. */}
                {item.vendor_id || (
                  <span className="text-muted-foreground italic">
                    {item.is_needs_canvass
                      ? "Empty — in canvassing"
                      : "Not set"}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge tone={purchaseRequestItemTone[item.status]}>
                  {purchaseRequestItemStatusLabels[item.status]}
                </StatusBadge>
              </TableCell>
              <TableCell>
                {proof ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <StatusDot tone="success" />
                    Uploaded
                  </span>
                ) : selectable ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <StatusDot tone="warning" />
                    Not uploaded
                  </span>
                ) : item.status === "completed" ? (
                  <span className="text-xs text-muted-foreground">
                    Proof on file
                  </span>
                ) : item.status === "canvassing" ? (
                  <Link
                    href={`/purchase-requests/${request._id}/canvassing`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                  >
                    View Canvassing
                    <ArrowRightIcon className="size-3.5" aria-hidden />
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {proof ? (
                  formatShortDate(proof.delivery_date)
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
