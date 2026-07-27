"use client";

import { LayoutGridIcon, TableIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

export type ListView = "cards" | "table";

/**
 * Switches the purchase request list between card and table views. Backed by
 * the URL so the choice survives reload and can be linked to.
 */
export function ViewToggle({ view }: { view: ListView }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(next: ListView) {
    const params = new URLSearchParams(searchParams);
    if (next === "cards") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <ButtonGroup aria-label="List view">
      <Button
        variant={view === "cards" ? "secondary" : "outline"}
        size="sm"
        aria-current={view === "cards" ? "true" : undefined}
        render={<Link href={hrefFor("cards")} />}
        nativeButton={false}
      >
        <LayoutGridIcon data-icon="inline-start" />
        Cards
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "outline"}
        size="sm"
        aria-current={view === "table" ? "true" : undefined}
        render={<Link href={hrefFor("table")} />}
        nativeButton={false}
      >
        <TableIcon data-icon="inline-start" />
        Table
      </Button>
    </ButtonGroup>
  );
}
