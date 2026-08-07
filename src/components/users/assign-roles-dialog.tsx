"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import { ErrorAlert } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { MAX_PAGE_SIZE } from "@/lib/api/pagination";
import { roleListQuery } from "@/modules/roles";
import { updateUserRoles, userKeys } from "@/modules/users";

/**
 * Assigns roles to one user via `PATCH /users/{id}/roles`. The role catalogue
 * comes from `GET /roles`, fetched at the backend's page-size cap the same
 * way the role form dialog loads the permission catalogue — roles are a
 * small, admin-managed list, not a collection worth paginating through here.
 */
export function AssignRolesDialog({
  open,
  onOpenChange,
  userId,
  userName,
  assignedRoleIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  /** The user's current role ids, used to pre-select the picker. */
  assignedRoleIds: string[];
}) {
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(assignedRoleIds),
  );
  const [search, setSearch] = React.useState("");
  const queryClient = useQueryClient();

  // Reopening for a different user has to reset the whole form, including the
  // search box — otherwise a stale search would hide most of the catalogue.
  const [lastOpenedFor, setLastOpenedFor] = React.useState<string | null>(null);
  if (open && lastOpenedFor !== userId) {
    setLastOpenedFor(userId);
    setSelected(new Set(assignedRoleIds));
    setSearch("");
  }

  const {
    data: rolesPage,
    isPending,
    isError,
    error,
  } = useQuery({ ...roleListQuery(1, "", MAX_PAGE_SIZE), enabled: open });

  const roles = rolesPage?.data ?? [];
  const totalRoles = rolesPage?.pagination.total_items ?? 0;

  const query = search.trim().toLowerCase();
  const visibleRoles = query
    ? roles.filter(
        (role) =>
          role.title.toLowerCase().includes(query) ||
          role.description.toLowerCase().includes(query),
      )
    : roles;

  const selectedCount = selected.size;

  function toggleRole(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const { mutate: submit, isPending: submitting } = useMutation({
    mutationFn: (roleIds: string[]) =>
      updateUserRoles(userId, { role_ids: roleIds }),
    onSuccess: () => {
      toast.add({ title: `Roles updated for ${userName}`, type: "success" });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      onOpenChange(false);
    },
    onError: (mutationError) => {
      toast.add({
        title: "Couldn't update roles",
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Something went wrong.",
        type: "error",
      });
    },
  });

  function save() {
    submit(Array.from(selected));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[560px]">
        <DialogHeader className="gap-1 border-b px-5 py-4 pr-12">
          <DialogTitle>Assign roles</DialogTitle>
          <DialogDescription>
            Choose the roles {userName} should have. Changes apply the next time
            they sign in.
          </DialogDescription>
        </DialogHeader>

        {/* The role list is the only scroller, so the toolbar and footer stay put. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b bg-accent px-5 py-3">
            <InputGroup className="w-[220px] bg-background">
              <InputGroupInput
                type="search"
                value={search}
                placeholder="Search roles…"
                aria-label="Search roles"
                onChange={(event) => setSearch(event.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
            </InputGroup>
            <p className="text-xs text-muted-foreground tabular-nums">
              {selectedCount} of {totalRoles} roles selected
            </p>
          </div>

          <div className="flex flex-col gap-1 px-5 py-4">
            {isError ? (
              <ErrorAlert title="Couldn't load roles" error={error} />
            ) : isPending ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 4 }, (_, row) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder rows
                  <Skeleton key={row} className="h-10 w-full" />
                ))}
              </div>
            ) : visibleRoles.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No roles match &ldquo;{search.trim()}&rdquo;
              </p>
            ) : (
              visibleRoles.map((role) => (
                <Label
                  key={role._id}
                  htmlFor={`assign-role-${role._id}`}
                  className="items-start gap-2.5 rounded-lg px-2 py-1.5 font-normal hover:bg-accent"
                >
                  <Checkbox
                    id={`assign-role-${role._id}`}
                    className="mt-0.5"
                    checked={selected.has(role._id)}
                    onCheckedChange={(checked) => toggleRole(role._id, checked)}
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-medium">{role.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {role.description}
                    </span>
                  </span>
                </Label>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 rounded-b-xl border-t bg-accent px-5 py-3.5">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={submitting} onClick={save}>
            {submitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
