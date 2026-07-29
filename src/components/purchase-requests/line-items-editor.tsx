"use client";

import { PlusIcon, XIcon } from "lucide-react";
import * as React from "react";

import { LookupPicker } from "@/components/purchase-requests/lookup-picker";
import { StatusDot } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  type DraftLineItem,
  fetchMaterialOptions,
  fetchVendorOptions,
} from "@/modules/purchase-requests";

/**
 * Editable line items backed by the live material catalog.
 *
 * Sourcing is derived from the material's `is_needs_canvass` flag rather than
 * chosen here, matching the wireframe's "determined automatically" note. Line
 * totals are absent because materials currently sync without a cost — see the
 * note in the card footer.
 */

export function createDraftLine(key: string): DraftLineItem {
  return {
    key,
    materialId: null,
    materialName: null,
    unit: null,
    quantity: 1,
    sourcing: "canvassing",
    vendorId: null,
    vendorName: null,
  };
}

export function LineItemsEditor({
  lines,
  onChange,
}: {
  lines: DraftLineItem[];
  onChange: (lines: DraftLineItem[]) => void;
}) {
  const nextKey = React.useRef(lines.length + 1);

  const loadMaterials = React.useCallback(
    (params: {
      page: number;
      pageSize: number;
      search: string;
      signal: AbortSignal;
    }) => fetchMaterialOptions(params),
    [],
  );

  const loadVendors = React.useCallback(
    (params: {
      page: number;
      pageSize: number;
      search: string;
      signal: AbortSignal;
    }) => fetchVendorOptions(params),
    [],
  );

  function updateLine(key: string, patch: Partial<DraftLineItem>) {
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function addLine() {
    nextKey.current += 1;
    onChange([...lines, createDraftLine(`line-${nextKey.current}`)]);
  }

  function removeLine(key: string) {
    onChange(lines.filter((line) => line.key !== key));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
        <CardTitle>Items</CardTitle>
        <span className="text-xs text-muted-foreground">
          {lines.length} {lines.length === 1 ? "item" : "items"}
        </span>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <StatusDot tone="info" /> Needs Canvassing
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot tone="neutral" /> Direct — Vendor Pre-selected
        </span>
        <span className="italic">
          — determined automatically, not editable here
        </span>
      </CardContent>

      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className="w-8 pl-4">
                #
              </TableHead>
              <TableHead scope="col" className="min-w-56">
                Item
              </TableHead>
              <TableHead scope="col">Qty</TableHead>
              <TableHead scope="col">Unit</TableHead>
              <TableHead scope="col">Sourcing</TableHead>
              <TableHead scope="col" className="min-w-44">
                Vendor
              </TableHead>
              <TableHead scope="col" className="w-8 pr-4">
                <span className="sr-only">Remove</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={line.key}>
                <TableCell className="pl-4 text-muted-foreground">
                  {index + 1}
                </TableCell>

                <TableCell>
                  <LookupPicker
                    value={
                      line.materialId && line.materialName
                        ? { id: line.materialId, label: line.materialName }
                        : null
                    }
                    loadPage={loadMaterials}
                    placeholder="Select an item"
                    searchPlaceholder="Search the catalog…"
                    ariaLabel={`Item for line ${index + 1}`}
                    onSelect={(option) =>
                      updateLine(line.key, {
                        materialId: option.id,
                        materialName: option.label,
                        unit: option.unit ?? null,
                        // Canvassed items get their vendor during canvassing,
                        // so any previously chosen vendor is dropped.
                        sourcing: option.needsCanvass ? "canvassing" : "direct",
                        vendorId: null,
                        vendorName: null,
                      })
                    }
                  />
                </TableCell>

                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    value={line.quantity}
                    aria-label={`Quantity for line ${index + 1}`}
                    className="h-7 w-16"
                    onChange={(event) =>
                      updateLine(line.key, {
                        quantity: Number(event.target.value) || 0,
                      })
                    }
                  />
                </TableCell>

                <TableCell className="text-muted-foreground">
                  {line.unit ?? "—"}
                </TableCell>

                <TableCell>
                  {line.materialId === null ? (
                    <span className="text-xs text-muted-foreground">
                      Set once an item is picked
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        line.sourcing === "canvassing"
                          ? "text-status-info"
                          : "text-muted-foreground",
                      )}
                    >
                      <StatusDot
                        tone={
                          line.sourcing === "canvassing" ? "info" : "neutral"
                        }
                      />
                      {line.sourcing === "canvassing"
                        ? "Needs Canvassing"
                        : "Direct"}
                    </span>
                  )}
                </TableCell>

                <TableCell>
                  {line.sourcing === "direct" && line.materialId ? (
                    <LookupPicker
                      value={
                        line.vendorId && line.vendorName
                          ? { id: line.vendorId, label: line.vendorName }
                          : null
                      }
                      loadPage={loadVendors}
                      placeholder="Select a vendor"
                      searchPlaceholder="Search vendors…"
                      ariaLabel={`Vendor for line ${index + 1}`}
                      onSelect={(option) =>
                        updateLine(line.key, {
                          vendorId: option.id,
                          vendorName: option.label,
                        })
                      }
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      {line.materialId === null
                        ? "—"
                        : "Empty — set during canvassing"}
                    </span>
                  )}
                </TableCell>

                <TableCell className="pr-4">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove line ${index + 1}`}
                    onClick={() => removeLine(line.key)}
                  >
                    <XIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardContent>
        <Button variant="outline" size="sm" type="button" onClick={addLine}>
          <PlusIcon data-icon="inline-start" />
          Add Item
        </Button>
      </CardContent>

      <Separator />

      <CardFooter className="justify-end">
        <p className="text-right text-xs text-muted-foreground">
          Estimated totals aren&apos;t available — materials sync without a unit
          cost.
        </p>
      </CardFooter>
    </Card>
  );
}
