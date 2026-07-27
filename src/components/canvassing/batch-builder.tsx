"use client";

import Link from "next/link";
import * as React from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CanvassingDetail } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Groups items into a batch to send out for quotation together. Items already
 * assigned to a batch start unselected.
 */
export function BatchBuilder({
  purchaseRequestId,
  items,
}: {
  purchaseRequestId: string;
  items: CanvassingDetail["items"];
}) {
  const [selected, setSelected] = React.useState<string[]>(() =>
    items.filter((item) => item.batch === 1).map((item) => item.id),
  );

  function toggle(id: string, checked: boolean) {
    setSelected((current) =>
      checked ? [...current, id] : current.filter((entry) => entry !== id),
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
        <CardTitle>Items in this Purchase Request</CardTitle>
        <span className="text-xs text-muted-foreground">
          Select items to send out for quotation together
        </span>
      </CardHeader>

      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-8 pl-4">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead scope="col">Item</TableHead>
              <TableHead scope="col">Qty</TableHead>
              <TableHead scope="col">Batch</TableHead>
              <TableHead scope="col" className="pr-4">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isSelected = selected.includes(item.id);

              return (
                <TableRow
                  key={item.id}
                  className={cn(isSelected && "bg-status-info/5")}
                >
                  <TableCell className="pl-4">
                    <Checkbox
                      checked={isSelected}
                      aria-label={`Select ${item.name}`}
                      onCheckedChange={(checked) =>
                        toggle(item.id, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {item.batch === null ? (
                      <span className="text-xs text-muted-foreground">
                        Not assigned
                      </span>
                    ) : (
                      <Badge
                        variant="outline"
                        className={cn(
                          item.batch > 1 &&
                            "border-status-ordered/30 bg-status-ordered/10 text-status-ordered",
                        )}
                      >
                        Batch {item.batch}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4">
                    <StatusBadge tone={item.statusTone}>
                      {item.status}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {selected.length} {selected.length === 1 ? "item" : "items"} selected
          {selected.length > 0 ? " — not yet grouped into an active batch" : ""}
        </span>
        <Button
          size="sm"
          disabled={selected.length === 0}
          render={<Link href={`/canvassing/${purchaseRequestId}/quotes/new`} />}
        >
          Create Quotation for Selected Items →
        </Button>
      </CardFooter>
    </Card>
  );
}
