import { SearchIcon } from "lucide-react";
import {
  FilterSelect,
  type FilterSelectOption,
} from "@/components/shared/filter-select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export interface ToolbarFilter {
  label: string;
  options: string[] | FilterSelectOption[];
  /** Controlled selection; omit to leave the filter presentational. */
  value?: string | null;
  onValueChange?: (value: string | null) => void;
}

/**
 * Free-text filter plus a row of dropdown filters. Wraps on narrow screens.
 *
 * Both the search box and each dropdown are controlled only when their
 * `*value`/`on*Change` props are supplied — omit them and a filter stays
 * presentational, which is what most callers want today.
 */
export function DataToolbar({
  placeholder,
  filters,
  className,
  searchValue,
  onSearchChange,
}: {
  placeholder: string;
  filters: ToolbarFilter[];
  className?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <InputGroup className="h-8 w-full rounded-md sm:w-64">
        <InputGroupInput
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={
            onSearchChange
              ? (event) => onSearchChange(event.target.value)
              : undefined
          }
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      {filters.map((filter) => (
        <FilterSelect
          key={filter.label}
          label={filter.label}
          options={filter.options}
          value={filter.value}
          onValueChange={filter.onValueChange}
        />
      ))}
    </div>
  );
}
