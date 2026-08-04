"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  label: string;
  value: string;
}

/**
 * Toolbar filter dropdown. The first item is the unfiltered state, so the
 * trigger shows the filter's name until a value is picked.
 *
 * Plain strings double as both label and value; pass `{ label, value }` pairs
 * when the selectable value (e.g. a department id) differs from what's shown.
 * Supplying `onValueChange` puts the select under URL/state control instead of
 * its own internal selection.
 */
export function FilterSelect({
  label,
  options,
  value,
  onValueChange,
  className,
}: {
  label: string;
  options: string[] | FilterSelectOption[];
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  className?: string;
}) {
  const normalizedOptions = options.map((option) =>
    typeof option === "string" ? { label: option, value: option } : option,
  );
  const items = [{ label, value: null }, ...normalizedOptions];
  const controlledProps = onValueChange
    ? {
        value: value ?? null,
        onValueChange: (next: string | null | undefined) =>
          onValueChange(next ?? null),
      }
    : {};

  return (
    <Select items={items} {...controlledProps}>
      <SelectTrigger
        size="sm"
        className={cn("h-8 rounded-md text-[13px]", className)}
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.label} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
