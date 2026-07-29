"use client";

import { PlusIcon, XIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { StatusDot } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCatalogItems, useVendors } from "@/hooks/reference";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn, formatCurrency } from "@/lib/utils";
import type { CatalogItem } from "@/types";

export interface DraftLine {
    key: string;
    /** Null while the row is a blank "not in catalog" placeholder. */
    itemName: string | null;
    quantity: number;
    unitCost: number | null;
    unit: string | null;
    /** Direct lines pick a vendor now; canvassing lines get one later. */
    sourcing: "direct" | "canvassing" | "pending-item-creation";
    vendor: string | null;
}

/** A blank row, used for the initial line and for "Add item". */
export function createEmptyLine(key: string): DraftLine {
    return {
        key,
        itemName: null,
        quantity: 1,
        unitCost: null,
        unit: null,
        sourcing: "canvassing",
        vendor: null,
    };
}

function lineTotal(line: DraftLine) {
    if (line.unitCost === null) return null;
    return line.quantity * line.unitCost;
}

/** How close to the end of the loaded list counts as "pull the next page". */
const PAGE_AHEAD_PX = 48;

/**
 * Searchable item picker over the paged catalog.
 *
 * Typing searches upstream rather than filtering the loaded pages — the catalog
 * runs to ~1,900 materials, so anything else would answer "no items found" for
 * a match the picker simply had not scrolled to yet. Hence `filter={null}`:
 * the list is already narrowed by the time it arrives, and filtering it a
 * second time in the browser would only re-hide rows the server just matched.
 *
 * Upstream also matches the item code, not just the description, so a code
 * typed into the box finds its material.
 */
function CatalogItemCombobox({
    value,
    onSelect,
}: {
    value: string | null;
    onSelect: (item: CatalogItem | null) => void;
}) {
    const [query, setQuery] = React.useState("");
    // Each distinct term is its own query and its own upstream request, so the
    // raw keystrokes never reach it.
    const search = useDebouncedValue(query.trim()) || undefined;

    const {
        items,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
    } = useCatalogItems(search);

    // Deduped across pages, not just within one: a name is the item's key here,
    // and pages are collapsed by name individually, so only the flattened list
    // can catch the same description arriving on two of them.
    const names = [...new Set(items.map((item) => item.name))];
    // A search response need not contain the item this line already holds, and
    // a value with no matching item would leave the input blank.
    if (value && !names.includes(value)) names.unshift(value);

    function handleScroll(event: React.UIEvent<HTMLDivElement>) {
        if (!hasNextPage || isFetchingNextPage) return;

        const list = event.currentTarget;
        const remaining =
            list.scrollHeight - list.scrollTop - list.clientHeight;
        if (remaining < PAGE_AHEAD_PX) fetchNextPage();
    }

    return (
        <Combobox
            items={names}
            value={value}
            filter={null}
            onValueChange={(next) =>
                onSelect(items.find((item) => item.name === next) ?? null)
            }
            onInputValueChange={setQuery}
        >
            <ComboboxInput
                showClear
                placeholder="Search items"
                aria-label="Item"
                className="h-7 w-full"
            />
            <ComboboxContent>
                <ComboboxEmpty>
                    {isFetching ? (
                        "Searching catalog…"
                    ) : (
                        <span className="flex items-center gap-2">
                            No items found.
                            <Link
                                href="/purchase-requests/item-requests"
                                className="underline"
                            >
                                Request New Item →
                            </Link>
                        </span>
                    )}
                </ComboboxEmpty>
                <ComboboxList onScroll={handleScroll}>
                    {(itemName: string) => (
                        <ComboboxItem key={itemName} value={itemName}>
                            {itemName}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

/**
 * Editable line items with live totals. Sourcing is derived from the catalog
 * entry, not chosen here — matching the wireframe's "determined automatically"
 * note.
 */
export function LineItemsEditor({
    lines,
    onLinesChange,
}: {
    lines: DraftLine[];
    onLinesChange: (lines: DraftLine[]) => void;
}) {
    // The vendor list comes from the API rather than module scope, so the picker
    // reflects whatever the backend actually has. The catalog is not fetched
    // here: each row's picker searches it independently and hands back the entry
    // it matched, so nothing up here needs the whole list to look one up.
    const { data: vendors = [] } = useVendors();
    const nextKey = React.useRef(lines.length + 1);

    const vendorOptions = [
        { label: "Select a vendor", value: null },
        ...vendors.map((vendor) => ({ label: vendor, value: vendor })),
    ];

    const total = lines.reduce((sum, line) => sum + (lineTotal(line) ?? 0), 0);

    function updateLine(key: string, patch: Partial<DraftLine>) {
        onLinesChange(
            lines.map((line) =>
                line.key === key ? { ...line, ...patch } : line,
            ),
        );
    }

    function addLine() {
        nextKey.current += 1;
        onLinesChange([...lines, createEmptyLine(`line-${nextKey.current}`)]);
    }

    function removeLine(key: string) {
        onLinesChange(lines.filter((line) => line.key !== key));
    }

    /**
     * Clearing the picker returns the row to the blank state it started in.
     * "Not in catalog" is no longer reachable from here — a search box cannot
     * offer an item the catalog does not have — so that prompt moved to the
     * picker's own empty state, where the user is actually looking for it.
     */
    function selectItem(key: string, entry: CatalogItem | null) {
        updateLine(key, {
            itemName: entry?.name ?? null,
            unit: entry?.unit ?? null,
            unitCost: entry?.unitCost ?? null,
            sourcing: "canvassing",
            vendor: null,
        });
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
                            <TableHead scope="col">Est. Unit Cost</TableHead>
                            <TableHead scope="col">Est. Total</TableHead>
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
                        {lines.map((line, index) => {
                            const computed = lineTotal(line);
                            const notInCatalog =
                                line.sourcing === "pending-item-creation";

                            return (
                                <TableRow key={line.key}>
                                    <TableCell className="pl-4 text-muted-foreground">
                                        {index + 1}
                                    </TableCell>

                                    <TableCell>
                                        {notInCatalog ? (
                                            <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-status-warning/50 bg-status-warning/10 px-2 py-1 text-xs text-status-warning">
                                                Item not found in catalog
                                                <Link
                                                    href="/purchase-requests/item-requests"
                                                    className="underline"
                                                >
                                                    Request New Item →
                                                </Link>
                                            </div>
                                        ) : (
                                            <CatalogItemCombobox
                                                value={line.itemName}
                                                onSelect={(entry) =>
                                                    selectItem(line.key, entry)
                                                }
                                            />
                                        )}
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
                                                    quantity:
                                                        Number(
                                                            event.target.value,
                                                        ) || 0,
                                                })
                                            }
                                        />
                                    </TableCell>

                                    <TableCell className="text-muted-foreground">
                                        {line.unit ?? "—"}
                                    </TableCell>

                                    <TableCell>
                                        {line.unitCost === null ? (
                                            <span className="text-muted-foreground">
                                                —
                                            </span>
                                        ) : (
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={line.unitCost}
                                                aria-label={`Estimated unit cost for line ${index + 1}`}
                                                className="h-7 w-24"
                                                onChange={(event) =>
                                                    updateLine(line.key, {
                                                        unitCost:
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ) || 0,
                                                    })
                                                }
                                            />
                                        )}
                                    </TableCell>

                                    <TableCell
                                        className={cn(
                                            computed === null
                                                ? "text-muted-foreground"
                                                : "font-medium",
                                        )}
                                    >
                                        {computed === null
                                            ? "Pending"
                                            : formatCurrency(computed, true)}
                                    </TableCell>

                                    <TableCell>
                                        {notInCatalog ? (
                                            <span className="text-xs text-muted-foreground">
                                                Set after item is created
                                            </span>
                                        ) : (
                                            <span
                                                className={cn(
                                                    "flex items-center gap-1.5 text-xs",
                                                    line.sourcing ===
                                                        "canvassing"
                                                        ? "text-status-info"
                                                        : "text-muted-foreground",
                                                )}
                                            >
                                                <StatusDot
                                                    tone={
                                                        line.sourcing ===
                                                        "canvassing"
                                                            ? "info"
                                                            : "neutral"
                                                    }
                                                />
                                                {line.sourcing === "canvassing"
                                                    ? "Needs Canvassing"
                                                    : "Direct"}
                                            </span>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        {line.sourcing === "direct" ? (
                                            <Select
                                                items={vendorOptions}
                                                value={line.vendor}
                                                onValueChange={(value) =>
                                                    updateLine(line.key, {
                                                        vendor: value as
                                                            | string
                                                            | null,
                                                    })
                                                }
                                            >
                                                <SelectTrigger
                                                    size="sm"
                                                    className="w-full"
                                                    aria-label="Vendor"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {vendorOptions.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.label
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">
                                                {notInCatalog
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
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>

            <Separator />

            <CardContent>
                <Button variant="outline" size="sm" onClick={addLine}>
                    <PlusIcon data-icon="inline-start" />
                    Add Item
                </Button>
            </CardContent>

            <CardFooter className="justify-end">
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                        Total Estimated Amount
                    </p>
                    <p className="text-lg font-semibold">
                        {formatCurrency(total, true)}
                    </p>
                </div>
            </CardFooter>
        </Card>
    );
}
