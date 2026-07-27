import { Badge } from "@/components/ui/badge";
import type { StatusTone } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Each tone derives its tint, border, and text from a single status token, so
 * a status reads identically everywhere and stays legible in both themes.
 */
const toneClasses: Record<StatusTone, string> = {
  neutral: "border-status-neutral/30 bg-status-neutral/10 text-status-neutral",
  info: "border-status-info/30 bg-status-info/10 text-status-info",
  ordered: "border-status-ordered/30 bg-status-ordered/10 text-status-ordered",
  partial: "border-status-partial/30 bg-status-partial/10 text-status-partial",
  success: "border-status-success/30 bg-status-success/10 text-status-success",
  warning: "border-status-warning/30 bg-status-warning/10 text-status-warning",
  danger: "border-status-danger/30 bg-status-danger/10 text-status-danger",
};

export function StatusBadge({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Badge> & { tone: StatusTone }) {
  return (
    <Badge
      variant="outline"
      className={cn("h-auto whitespace-normal", toneClasses[tone], className)}
      {...props}
    >
      {children}
    </Badge>
  );
}

/** Solid dot used by the status legend and the sourcing indicators. */
export function StatusDot({
  tone,
  className,
}: {
  tone: StatusTone;
  className?: string;
}) {
  const dotClasses: Record<StatusTone, string> = {
    neutral: "bg-status-neutral",
    info: "bg-status-info",
    ordered: "bg-status-ordered",
    partial: "bg-status-partial",
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
  };

  return (
    <span
      aria-hidden
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        dotClasses[tone],
        className,
      )}
    />
  );
}
