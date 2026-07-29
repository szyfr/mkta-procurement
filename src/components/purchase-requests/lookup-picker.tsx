"use client";

import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  LOOKUP_PAGE_SIZE,
  type LookupOption,
} from "@/modules/purchase-requests";

/**
 * Reference-data picker for collections too large to put in a `<Select>` —
 * the material catalog runs to roughly 1,900 rows and vendors to nearly 300.
 *
 * Results are pulled a page at a time from the BFF and appended as the list is
 * scrolled, with a debounced search box to narrow them.
 */

export interface LookupPickerProps {
  value: { id: string; label: string } | null;
  onSelect: (option: LookupOption) => void;
  /** Fetches one page of results. Provided by the caller so the picker stays generic. */
  loadPage: (params: {
    page: number;
    pageSize: number;
    search: string;
    signal: AbortSignal;
  }) => Promise<{ options: LookupOption[]; page: { totalPages: number } }>;
  placeholder: string;
  searchPlaceholder: string;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

const SEARCH_DEBOUNCE_MS = 300;

export function LookupPicker({
  value,
  onSelect,
  loadPage,
  placeholder,
  searchPlaceholder,
  ariaLabel,
  disabled,
  className,
}: LookupPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [options, setOptions] = React.useState<LookupOption[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Settling on a new search term also restarts paging from the top.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      setOptions([]);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [search]);

  /**
   * Guards against refetching the same page twice — under StrictMode, and
   * whenever a caller passes an unmemoized `loadPage`.
   */
  const requestedPageRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      // A reopened picker starts paging over, so drop the results it collected
      // last time — otherwise the refetched page is appended to rows already
      // holding it. Clearing the guard also lets a failed load retry.
      requestedPageRef.current = null;
      setPage(1);
      setOptions((current) => (current.length === 0 ? current : []));
      return;
    }

    const key = `${debouncedSearch}::${page}`;
    if (requestedPageRef.current === key) return;
    requestedPageRef.current = key;

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    loadPage({
      page,
      pageSize: LOOKUP_PAGE_SIZE,
      search: debouncedSearch,
      signal: controller.signal,
    })
      .then((result) => {
        setTotalPages(result.page.totalPages);
        setOptions((current) =>
          page === 1 ? result.options : [...current, ...result.options],
        );
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          cause instanceof Error ? cause.message : "Couldn't load options.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [open, page, debouncedSearch, loadPage]);

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (loading || page >= totalPages) return;

    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 48) {
      setPage((current) => current + 1);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn("w-full justify-between font-normal", className)}
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value?.label ?? placeholder}
            </span>
            <ChevronsUpDownIcon className="shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent align="start" className="w-80 gap-0 p-0">
        <div className="border-b p-2">
          <InputGroup className="h-8">
            <InputGroupInput
              type="search"
              value={search}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div
          role="listbox"
          aria-label={ariaLabel}
          className="max-h-64 overflow-y-auto p-1"
          onScroll={handleScroll}
        >
          {error ? (
            <p className="px-2 py-6 text-center text-xs text-destructive">
              {error}
            </p>
          ) : options.length === 0 && !loading ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No matches.
            </p>
          ) : (
            options.map((option) => {
              const selected = option.id === value?.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted"
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "size-3.5 shrink-0",
                      !selected && "opacity-0",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.hint ? (
                      <span className="block truncate text-muted-foreground">
                        {option.hint}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })
          )}

          {loading ? (
            <p className="flex items-center justify-center gap-2 px-2 py-3 text-xs text-muted-foreground">
              <Spinner className="size-3.5" />
              Loading…
            </p>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
