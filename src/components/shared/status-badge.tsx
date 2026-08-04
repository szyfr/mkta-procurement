import { Badge } from "@/components/ui/badge";
import type { StatusTone } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Each tone names its own tint, border and text rather than reading one colour
 * at three opacities — the palettes pick those three independently, and a
 * green that is legible as text is too dark to sit behind it. A status reads
 * identically on every page because the tone, not the page, chooses.
 */
const toneClasses: Record<StatusTone, string> = {
  neutral:
    "border-status-neutral-border bg-status-neutral-bg text-status-neutral-fg",
  info: "border-status-info-border bg-status-info-bg text-status-info-fg",
  ordered:
    "border-status-ordered-border bg-status-ordered-bg text-status-ordered-fg",
  partial:
    "border-status-partial-border bg-status-partial-bg text-status-partial-fg",
  success:
    "border-status-success-border bg-status-success-bg text-status-success-fg",
  warning:
    "border-status-warning-border bg-status-warning-bg text-status-warning-fg",
  danger:
    "border-status-danger-border bg-status-danger-bg text-status-danger-fg",
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
      className={cn(
        "rounded-sm text-[11px] leading-none font-semibold",
        toneClasses[tone],
        className,
      )}
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
        "size-2 shrink-0 rounded-full",
        dotClasses[tone],
        className,
      )}
    />
  );
}
