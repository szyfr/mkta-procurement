"use client";

import { StatusBadge, StatusDot } from "@/components/shared/status-badge";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { initials, roleStatusLabels, roleStatusTone } from "@/data/roles";
import type { RoleAssignee, RoleStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Small pieces the roles list, the form dialog and the detail sheet all draw
 * the same way. Kept here so a grant count or an avatar stack reads
 * identically wherever it appears.
 */

export function RoleStatusBadge({ status }: { status: RoleStatus }) {
  const tone = roleStatusTone[status];

  return (
    <StatusBadge tone={tone} className="gap-1.5 px-2">
      <StatusDot tone={tone} className="size-1.5" />
      {roleStatusLabels[status]}
    </StatusBadge>
  );
}

/** Section heading used inside the dialog and the sheet. */
export function SectionLabel({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

/**
 * `3 / 5` grant counter. Tinted once anything is granted, so a module's state
 * is readable without expanding it.
 */
export function GrantChip({
  granted,
  total,
  highlight = granted > 0,
  className,
}: {
  granted: number;
  total: number;
  /** The sheet tints only fully granted modules; the dialog tints any grant. */
  highlight?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 text-xs font-semibold tabular-nums",
        highlight
          ? "border-status-success/30 bg-status-success/10 text-status-success"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {granted} / {total}
    </span>
  );
}

/** Overlapping avatars, capped at three, with the total spelled out beside. */
export function AssigneeStack({ assignees }: { assignees: RoleAssignee[] }) {
  if (assignees.length === 0) {
    return (
      <span className="text-xs text-muted-foreground italic">Unassigned</span>
    );
  }

  const shown = assignees.slice(0, 3);
  const overflow = assignees.length - shown.length;

  return (
    <div className="flex items-center gap-2">
      <AvatarGroup>
        {shown.map((person) => (
          <Avatar key={person.id} size="sm">
            <AvatarFallback className="text-[10px] font-semibold">
              {initials(person.name)}
            </AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0 ? (
          <AvatarGroupCount className="size-6 text-[10px] font-semibold">
            +{overflow}
          </AvatarGroupCount>
        ) : null}
      </AvatarGroup>
      <span className="text-xs whitespace-nowrap tabular-nums">
        {assignees.length} {assignees.length === 1 ? "user" : "users"}
      </span>
    </div>
  );
}

/**
 * Checkbox that also draws a partial state.
 *
 * Base UI exposes `indeterminate` and a matching `data-indeterminate`
 * attribute, but the generated checkbox only ever renders a check — the dash
 * is drawn here with a pseudo-element rather than by editing `components/ui`.
 */
export function TriStateCheckbox({
  className,
  ...props
}: React.ComponentProps<typeof Checkbox>) {
  return (
    <Checkbox
      className={cn(
        "data-indeterminate:border-primary data-indeterminate:bg-primary data-indeterminate:text-primary-foreground",
        "data-indeterminate:before:absolute data-indeterminate:before:h-0.5 data-indeterminate:before:w-2 data-indeterminate:before:rounded-full data-indeterminate:before:bg-current",
        "data-indeterminate:[&_svg]:hidden",
        className,
      )}
      {...props}
    />
  );
}
