/**
 * The one table treatment, applied to the `<Table>` element itself.
 *
 * shadcn's table ships roomier than this design system and tints its header;
 * the system wants a tighter, untinted header and a 12px cell. Expressing that
 * as descendant rules on the table means each of the app's tables opts in with
 * a single class instead of every `TableHead` and `TableCell` repeating the
 * same overrides — and `components/ui/table` stays generated.
 *
 * Deliberately absent: zebra striping, vertical rules, sticky headers.
 */
export const dataTableClass = [
  // Header: 10px/12px padding, 12px, weight 500, muted, no tint.
  "[&_thead_th]:h-auto [&_thead_th]:px-3 [&_thead_th]:py-2.5",
  "[&_thead_th]:text-xs [&_thead_th]:font-medium [&_thead_th]:text-muted-foreground",
  // Body: uniform 12px cell padding — no wider first/last gutter.
  "[&_tbody_td]:p-3",
  // Row hover is the accent tint, and beats the primitive's `bg-muted/50`.
  "[&_tbody_tr]:hover:bg-accent",
].join(" ");

/**
 * Same treatment for tables that stand on their own rather than inside a Card,
 * which supplies the 12px shell everywhere else.
 */
export const tableShellClass =
  "overflow-x-auto rounded-xl border bg-background";

/** Primary identifier in a cell, with its mono id line as a sibling. */
export const cellPrimaryClass = "text-[13.5px] font-semibold";

/** Ids, codes and SKUs — the mono face earns its keep here. */
export const cellIdClass = "font-mono text-[11px] text-muted-foreground";

/** Descriptions and meta beneath a primary identifier. */
export const cellMetaClass =
  "text-[12.5px] leading-[1.45] text-muted-foreground";
