"use client";

import { ChevronRightIcon, SearchIcon } from "lucide-react";
import * as React from "react";

import {
  GrantChip,
  SectionLabel,
  TriStateCheckbox,
} from "@/components/roles/role-primitives";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  grantedModuleCount,
  permissionModules,
  totalPermissionCount,
} from "@/data/roles";
import type { PermissionModule, Role, RoleStatus } from "@/lib/types";

/**
 * Create and edit share one dialog: the only differences are the copy and
 * whether the fields start populated. Nothing is persisted — saving closes the
 * dialog and confirms with a toast, because there is no roles endpoint yet.
 */

interface DraftRole {
  name: string;
  description: string;
  status: RoleStatus;
  permissions: Set<string>;
}

function draftFrom(role: Role | null): DraftRole {
  return {
    name: role?.name ?? "",
    description: role?.description ?? "",
    status: role?.status ?? "active",
    permissions: new Set(role?.permissions ?? []),
  };
}

/** Keys a module contributes, in catalogue order. */
function keysOf(module: PermissionModule) {
  return module.permissions.map(
    (permission) => `${module.key}.${permission.action}`,
  );
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The role being edited or duplicated; null when creating from scratch. */
  role: Role | null;
  mode: "create" | "edit";
}) {
  const [draft, setDraft] = React.useState<DraftRole>(() => draftFrom(role));
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  // Reopening for a different role has to reset the whole form, including the
  // toolbar state — otherwise a stale search would hide most of the catalogue.
  const [lastOpenedFor, setLastOpenedFor] = React.useState<string | null>(null);
  const openedFor = open ? `${mode}:${role?.id ?? "new"}` : null;
  if (openedFor !== lastOpenedFor) {
    setLastOpenedFor(openedFor);
    setDraft(draftFrom(role));
    setSearch("");
    setExpanded(new Set());
  }

  const query = search.trim().toLowerCase();

  /** Search matches a module by name, or any permission by label or key. */
  const visibleModules = React.useMemo(() => {
    if (!query) {
      return permissionModules.map((module) => ({
        module,
        permissions: module.permissions,
      }));
    }

    return permissionModules
      .map((module) => {
        const moduleMatches = module.name.toLowerCase().includes(query);
        const permissions = module.permissions.filter((permission) => {
          const key = `${module.key}.${permission.action}`;
          return (
            moduleMatches ||
            permission.label.toLowerCase().includes(query) ||
            key.toLowerCase().includes(query)
          );
        });
        return { module, permissions };
      })
      .filter((entry) => entry.permissions.length > 0);
  }, [query]);

  const grantedCount = draft.permissions.size;
  const moduleCount = grantedModuleCount(draft.permissions);
  const searching = query.length > 0;

  function togglePermission(key: string, granted: boolean) {
    setDraft((current) => {
      const permissions = new Set(current.permissions);
      if (granted) permissions.add(key);
      else permissions.delete(key);
      return { ...current, permissions };
    });
  }

  function setModuleGrants(keys: string[], granted: boolean) {
    setDraft((current) => {
      const permissions = new Set(current.permissions);
      for (const key of keys) {
        if (granted) permissions.add(key);
        else permissions.delete(key);
      }
      return { ...current, permissions };
    });
  }

  function toggleExpanded(moduleKey: string, isOpen: boolean) {
    setExpanded((current) => {
      const next = new Set(current);
      if (isOpen) next.add(moduleKey);
      else next.delete(moduleKey);
      return next;
    });
  }

  const allExpanded = visibleModules.every(
    (entry) => searching || expanded.has(entry.module.key),
  );

  function save() {
    toast.add({
      title: `${draft.name} ${mode === "edit" ? "updated" : "created"}`,
      type: "success",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[940px]">
        <DialogHeader className="gap-1 border-b px-5 py-4 pr-12">
          <DialogTitle className="text-lg font-semibold">
            {mode === "edit" ? "Edit role" : "New role"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Changes apply to everyone assigned to this role the next time they sign in."
              : "Name the role, then grant the permissions it needs. You can assign users afterwards."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 border-b px-5 py-4">
          <SectionLabel>Basic information</SectionLabel>
          <div className="grid gap-3.5 sm:grid-cols-[1fr_180px] sm:gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={draft.name}
                placeholder="e.g. Purchasing Officer"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="role-status">Status</Label>
              <Select
                value={draft.status}
                onValueChange={(value: RoleStatus | null) =>
                  setDraft((current) => ({
                    ...current,
                    status: value ?? "active",
                  }))
                }
              >
                <SelectTrigger id="role-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="role-description">Description</Label>
              <Input
                id="role-description"
                value={draft.description}
                placeholder="What this role is allowed to do, in one sentence."
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* The module list is the only scroller, so the toolbar and footer stay put. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-muted/50 px-5 py-3">
            <InputGroup className="w-[250px] bg-background">
              <InputGroupInput
                type="search"
                value={search}
                placeholder="Search permissions…"
                aria-label="Search permissions"
                onChange={(event) => setSearch(event.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
            <p className="text-xs text-muted-foreground tabular-nums">
              {grantedCount} of {totalPermissionCount} permissions selected
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={searching}
                onClick={() =>
                  setExpanded(
                    allExpanded
                      ? new Set()
                      : new Set(permissionModules.map((module) => module.key)),
                  )
                }
              >
                {allExpanded ? "Collapse all" : "Expand all"}
              </Button>
              <span aria-hidden className="h-5 w-px bg-border" />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    permissions: new Set(
                      permissionModules.flatMap((module) => keysOf(module)),
                    ),
                  }))
                }
              >
                Select all
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    permissions: new Set(),
                  }))
                }
              >
                Clear all
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 px-5 py-4">
            {visibleModules.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No permissions match &ldquo;{search.trim()}&rdquo;
              </p>
            ) : (
              visibleModules.map(({ module, permissions }) => {
                const moduleKeys = keysOf(module);
                const granted = moduleKeys.filter((key) =>
                  draft.permissions.has(key),
                ).length;
                const isFull = granted === moduleKeys.length;

                return (
                  <Collapsible
                    key={module.key}
                    // Searching forces every matching module open, so a hit is
                    // never hidden behind a collapsed header.
                    open={searching || expanded.has(module.key)}
                    onOpenChange={(isOpen) =>
                      toggleExpanded(module.key, isOpen)
                    }
                    className="overflow-hidden rounded-xl border"
                  >
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-2.5">
                      <Label
                        className="sr-only"
                        htmlFor={`module-${module.key}`}
                      >
                        Grant every {module.name} permission
                      </Label>
                      <TriStateCheckbox
                        id={`module-${module.key}`}
                        checked={isFull}
                        indeterminate={granted > 0 && !isFull}
                        onCheckedChange={(checked) =>
                          setModuleGrants(moduleKeys, checked)
                        }
                      />
                      <CollapsibleTrigger
                        render={
                          <button
                            type="button"
                            className="group/module -my-1 flex flex-1 items-center gap-2 py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                          />
                        }
                      >
                        <ChevronRightIcon className="size-3 shrink-0 text-muted-foreground transition-transform duration-150 ease-out group-data-panel-open/module:rotate-90" />
                        <span className="font-semibold">{module.name}</span>
                        <GrantChip
                          granted={granted}
                          total={moduleKeys.length}
                        />
                      </CollapsibleTrigger>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setModuleGrants(moduleKeys, true)}
                      >
                        Select all
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setModuleGrants(moduleKeys, false)}
                      >
                        Clear
                      </Button>
                    </div>
                    <CollapsibleContent className="border-t p-2">
                      <div className="grid gap-x-2.5 gap-y-0.5 sm:grid-cols-2">
                        {permissions.map((permission) => {
                          const key = `${module.key}.${permission.action}`;

                          return (
                            <Label
                              key={key}
                              htmlFor={key}
                              className="items-start gap-2.5 rounded-lg px-2 py-1.5 font-normal hover:bg-accent"
                            >
                              <Checkbox
                                id={key}
                                className="mt-0.5"
                                checked={draft.permissions.has(key)}
                                onCheckedChange={(checked) =>
                                  togglePermission(key, checked)
                                }
                              />
                              <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="font-medium">
                                  {permission.label}
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {key}
                                </span>
                              </span>
                            </Label>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-b-xl border-t bg-muted/50 px-5 py-3.5">
          <div className="min-w-0">
            <p className="font-semibold tabular-nums">
              {grantedCount} / {totalPermissionCount}
            </p>
            <p className="text-xs text-muted-foreground">
              {grantedCount === 0
                ? "No permissions granted yet — the role will have no access."
                : `permissions granted across ${moduleCount} ${moduleCount === 1 ? "module" : "modules"}`}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={draft.name.trim().length === 0} onClick={save}>
              {mode === "edit" ? "Save changes" : "Create role"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
