import { PencilIcon } from "lucide-react";

import { DeleteDepartmentDialog } from "@/components/departments/delete-department-dialog";
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
import type { Department } from "@/modules/departments";

export function DepartmentTable({
  departments,
  page,
  buildPageHref,
  onEdit,
}: {
  departments: Department[];
  page: PageInfo;
  buildPageHref: (page: number) => string;
  onEdit: (department: Department) => void;
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
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="font-medium">
                  {department.title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {department.description || (
                    <span className="italic">No description</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {department.createdAt ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {department.updatedAt ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Edit ${department.title}`}
                      onClick={() => onEdit(department)}
                    >
                      <PencilIcon />
                    </Button>
                    <DeleteDepartmentDialog department={department} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <TablePagination
        shown={departments.length}
        page={page}
        buildPageHref={buildPageHref}
      />
    </Card>
  );
}
