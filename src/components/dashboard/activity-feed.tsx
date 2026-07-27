import type { ActivityEntry } from "@/lib/types";

/** Timeline of recent events, each with a marker dot. */
export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  return (
    <ul className="divide-y">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-3 px-4 py-3">
          <span
            aria-hidden
            className="mt-1.5 size-2 shrink-0 rounded-full border border-muted-foreground/50"
          />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm">{entry.description}</p>
            <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
