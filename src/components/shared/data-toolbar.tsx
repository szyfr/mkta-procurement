import { SearchIcon } from "lucide-react";
import { FilterSelect } from "@/components/shared/filter-select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

export interface ToolbarFilter {
  label: string;
  options: string[];
}

/** Free-text filter plus a row of dropdown filters. Wraps on narrow screens. */
export function DataToolbar({
  placeholder,
  filters,
  className,
}: {
  placeholder: string;
  filters: ToolbarFilter[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <InputGroup className="h-8 w-full sm:w-64">
        <InputGroupInput type="search" placeholder={placeholder} />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>
      {filters.map((filter) => (
        <FilterSelect
          key={filter.label}
          label={filter.label}
          options={filter.options}
        />
      ))}
    </div>
  );
}
