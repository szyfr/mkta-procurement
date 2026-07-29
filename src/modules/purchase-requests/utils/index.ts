const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats a backend timestamp as the short date the wireframe uses, e.g.
 * "Jul 20". Built from fixed parts rather than `toLocaleDateString` so the
 * output never depends on the runtime's locale.
 */
export function formatShortDate(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Formats a backend timestamp for a date input, e.g. "2026-08-17". */
export function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}
