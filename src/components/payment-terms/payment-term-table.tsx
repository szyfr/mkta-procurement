import { PencilIcon } from "lucide-react";

import { DeletePaymentTermDialog } from "@/components/payment-terms/delete-payment-term-dialog";
import { dataTableClass } from "@/components/shared/table-classes";
import { TablePagination } from "@/components/shared/table-pagination";
import { Button } from "@/components/ui/button";
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
import type { PaymentTerm } from "@/modules/payment-terms";

export function PaymentTermTable({
  paymentTerms,
  page,
  buildPageHref,
  onEdit,
}: {
  paymentTerms: PaymentTerm[];
  page: PageInfo;
  buildPageHref: (page: number) => string;
  onEdit: (paymentTerm: PaymentTerm) => void;
}) {
  return (
    <Card>
      <CardContent className="px-0">
        <Table className={dataTableClass}>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Title</TableHead>
              <TableHead scope="col">Description</TableHead>
              <TableHead scope="col">Created At</TableHead>
              <TableHead scope="col">Updated At</TableHead>
              <TableHead scope="col">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentTerms.map((paymentTerm) => (
              <TableRow key={paymentTerm.id}>
                <TableCell className="font-medium">
                  {paymentTerm.title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {paymentTerm.description || (
                    <span className="italic">No description</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {paymentTerm.createdAt ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {paymentTerm.updatedAt ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${paymentTerm.title}`}
                      onClick={() => onEdit(paymentTerm)}
                    >
                      <PencilIcon />
                    </Button>
                    <DeletePaymentTermDialog paymentTerm={paymentTerm} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <TablePagination
        shown={paymentTerms.length}
        page={page}
        buildPageHref={buildPageHref}
      />
    </Card>
  );
}
