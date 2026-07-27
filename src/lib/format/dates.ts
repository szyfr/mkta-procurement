/**
 * Date handling for the seam between stored values and displayed ones.
 *
 * Calendar dates are stored and passed around as plain `YYYY-MM-DD` strings and
 * are formatted by string manipulation, never by constructing a `Date`.
 * `new Date("2026-07-20")` is parsed as UTC midnight, so any timezone west of
 * UTC renders it as "Jul 19" — the kind of off-by-one that only shows up for
 * some users, in some months.
 */

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
] as const;

/** The year the fixture dates belong to, taken from the PR id scheme. */
export const FIXTURE_YEAR = 2026;

/**
 * Turns a fixture label like "Jul 20" into an ISO date. Seed-time only — the
 * fixtures omit the year entirely.
 */
export function parseFixtureDate(label: string, year = FIXTURE_YEAR): string {
  const match = /^([A-Za-z]{3})\s+(\d{1,2})$/.exec(label.trim());
  if (!match) {
    throw new Error(`Unrecognised fixture date: "${label}"`);
  }

  const monthIndex = MONTHS.indexOf(match[1] as (typeof MONTHS)[number]);
  if (monthIndex < 0) {
    throw new Error(`Unrecognised month in fixture date: "${label}"`);
  }

  const month = String(monthIndex + 1).padStart(2, "0");
  const day = String(Number(match[2])).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** `2026-07-20` → `Jul 20`, the form every list row and timeline uses. */
export function formatShortDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;

  const monthIndex = Number(match[2]) - 1;
  const month = MONTHS[monthIndex];
  if (!month) return iso;

  return `${month} ${Number(match[3])}`;
}

/** Local-calendar date parts, used to compare days without timezone drift. */
function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function calendarDaysBetween(from: Date, to: Date): number {
  const msPerDay = 86_400_000;
  return Math.round((startOfDay(to) - startOfDay(from)) / msPerDay);
}

/**
 * Renders an instant the way the activity feed and notification list do:
 * "10 minutes ago", "2 hours ago", "Yesterday", "2 days ago", then a date.
 *
 * The calendar-day checks come before the elapsed-hours ones on purpose. An
 * event from 15:00 yesterday viewed at 02:00 is 11 hours old but still reads as
 * "Yesterday", which is what a reader expects.
 */
export function formatRelative(
  value: Date | number,
  now: Date = new Date(),
): string {
  const date = value instanceof Date ? value : new Date(value);
  const elapsedMs = now.getTime() - date.getTime();

  if (elapsedMs < 60_000) return "Just now";

  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const dayDelta = calendarDaysBetween(date, now);

  if (dayDelta === 0) {
    const hours = Math.floor(elapsedMs / 3_600_000);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  if (dayDelta === 1) return "Yesterday";
  if (dayDelta < 7) return `${dayDelta} days ago`;

  return formatShortDate(toIsoDate(date));
}

/** Whether a notification belongs in the "Today" group or the "Earlier" one. */
export function notificationGroup(
  value: Date | number,
  now: Date = new Date(),
): "today" | "earlier" {
  const date = value instanceof Date ? value : new Date(value);
  return calendarDaysBetween(date, now) === 0 ? "today" : "earlier";
}

/** Local-calendar `YYYY-MM-DD` for a `Date`. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Today, as a storable calendar date. */
export function todayIso(now: Date = new Date()): string {
  return toIsoDate(now);
}
