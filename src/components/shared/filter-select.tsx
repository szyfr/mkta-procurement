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
  value,
  onValueChange,
}: {
  label: string;
  options: string[];
  className?: string;
  /**
   * Optional controlled value. Toolbar filters are still display-only, but the
   * quote form needs to read back what was picked, so the component supports
   * both modes rather than existing in two copies.
   */
  value?: string | null;
  onValueChange?: (value: string | null) => void;
}) {
  const items = [
    { label, value: null },
    ...options.map((option) => ({ label: option, value: option })),
  ];

  const controlled = onValueChange !== undefined;

  return (
    <Select
      items={items}
      {...(controlled
        ? {
            value: value ?? null,
            onValueChange: (next: unknown) =>
              onValueChange(next === null ? null : String(next)),
          }
        : {})}
    >
      <SelectTrigger size="sm" className={className} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value ?? ""} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
