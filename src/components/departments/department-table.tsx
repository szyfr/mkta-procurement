import { PencilIcon } from "lucide-react";

import { DeleteDepartmentDialog } from "@/components/departments/delete-department-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Department, PageInfo } from "@/modules/departments";

/** Page numbers to render, windowed so long result sets stay readable. */
function pageWindow(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, start + 2);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function DepartmentTable({
  departments,
  page,
  buildPageHref,
  onEdit,
  onDeleted,
}: {
  departments: Department[];
  page: PageInfo;
  buildPageHref: (page: number) => string;
  onEdit: (department: Department) => void;
  onDeleted: (id: string) => void;
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
                    <DeleteDepartmentDialog
                      department={department}
                      onDeleted={onDeleted}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Showing {departments.length} of {page.totalItems}
        </span>
        {page.totalPages > 1 ? (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageHref(page.prevPage ?? 1)}
                  aria-disabled={page.prevPage === null}
                  className={
                    page.prevPage === null
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
              {pageWindow(page.currentPage, page.totalPages).map(
                (pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href={buildPageHref(pageNumber)}
                      isActive={pageNumber === page.currentPage}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href={buildPageHref(page.nextPage ?? page.totalPages)}
                  aria-disabled={page.nextPage === null}
                  className={
                    page.nextPage === null
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        ) : null}
      </CardFooter>
    </Card>
  );
}
