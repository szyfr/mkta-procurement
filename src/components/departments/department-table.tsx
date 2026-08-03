import { PencilIcon } from "lucide-react";

import { DeleteDepartmentDialog } from "@/components/departments/delete-department-dialog";
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="pl-4">
                Title
              </TableHead>
              <TableHead scope="col">Description</TableHead>
              <TableHead scope="col">Created At</TableHead>
              <TableHead scope="col">Updated At</TableHead>
              <TableHead scope="col" className="pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell className="pl-4 font-medium">
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
                <TableCell className="pr-4">
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
