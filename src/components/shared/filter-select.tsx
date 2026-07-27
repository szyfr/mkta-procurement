"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Toolbar filter dropdown. The first item is the unfiltered state, so the
 * trigger shows the filter's name until a value is picked.
 */
export function FilterSelect({
  label,
  options,
  className,
}: {
  label: string;
  options: string[];
  className?: string;
}) {
  const items = [
    { label, value: null },
    ...options.map((option) => ({ label: option, value: option })),
  ];

  return (
    <Select items={items}>
      <SelectTrigger size="sm" className={className} aria-label={label}>
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
