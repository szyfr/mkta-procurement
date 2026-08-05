import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Priority arrives as the backend's own lowercase value; the capitalized copy
 * is a render concern and lives here rather than being baked into the data on
 * the way in.
 */
const priorityLabels: Record<Priority, string> = {
  high: "High",
  normal: "Normal",
  low: "Low",
};

/** High priority gets a stronger border; the rest stay quiet. */
export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-sm text-[11px] leading-none font-semibold",
        priority === "high" && "border-foreground/40",
        className,
      )}
    >
      {priorityLabels[priority]}
    </Badge>
  );
}
