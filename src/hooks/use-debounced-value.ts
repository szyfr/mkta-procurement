"use client";

import { useEffect, useState } from "react";

/**
 * Delays a fast-changing value so a query does not fire on every keystroke.
 * Used by the global search box.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
