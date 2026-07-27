"use client";

import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { StatusBadge } from "@/components/shared/status-badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  maxResultsPerGroup,
  searchProcurement,
  searchResultGroups,
} from "@/data/search";
import { cn } from "@/lib/utils";

/**
 * Global search. Results are grouped by record type and capped per group, with
 * a "see all" row once anything was truncated.
 */
export function GlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const matches = React.useMemo(() => searchProcurement(query), [query]);

  const groups = React.useMemo(
    () =>
      searchResultGroups
        .map((type) => ({
          type,
          results: matches.filter((result) => result.type === type),
        }))
        .filter((group) => group.results.length > 0),
    [matches],
  );

  const truncated = groups.some(
    (group) => group.results.length > maxResultsPerGroup,
  );

  // Close when focus or a click lands outside the search box.
  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function clear() {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      clear();
    }
    if (event.key === "Enter" && matches.length > 0) {
      event.preventDefault();
      router.push(matches[0].href);
      setOpen(false);
    }
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <InputGroup className="h-8">
        <InputGroupInput
          ref={inputRef}
          // Not type="search" — the native clear affordance would sit beside
          // our own clear button.
          type="text"
          value={query}
          placeholder="Search PRs, POs, vendors, items…"
          aria-label="Search purchase requests, purchase orders, vendors, and items"
          aria-expanded={showDropdown}
          aria-controls="global-search-results"
          role="combobox"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        {query ? (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label="Clear search"
              onClick={clear}
            >
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>

      {showDropdown ? (
        <div
          id="global-search-results"
          className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
        >
          {groups.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-xs text-foreground">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-muted-foreground">
                Try a PR number, vendor name, or item keyword
              </p>
            </div>
          ) : (
            <>
              {groups.map((group, index) => (
                <div key={group.type}>
                  {index > 0 ? <Separator /> : null}
                  <p className="px-3 py-2 text-xs text-muted-foreground">
                    {group.type}
                  </p>
                  <ul>
                    {group.results
                      .slice(0, maxResultsPerGroup)
                      .map((result) => (
                        <li key={result.id}>
                          <Link
                            href={result.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            <span className="truncate">
                              {result.label}{" "}
                              <span className="text-muted-foreground">
                                — {result.detail}
                              </span>
                            </span>
                            {result.badge ? (
                              <StatusBadge
                                tone={result.badgeTone ?? "neutral"}
                                className="shrink-0"
                              >
                                {result.badge}
                              </StatusBadge>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
              {truncated ? (
                <>
                  <Separator />
                  <Link
                    href="/purchase-requests"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    See all results for &ldquo;{query}&rdquo; →
                  </Link>
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
