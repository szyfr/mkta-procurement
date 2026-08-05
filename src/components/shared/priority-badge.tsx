import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

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
        priority === "High" && "border-foreground/40",
        className,
      )}
    >
      {priority}
    </Badge>
  );
}
