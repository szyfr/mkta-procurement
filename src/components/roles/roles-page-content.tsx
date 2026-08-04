"use client";

import { DownloadIcon, PlusIcon, SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { DeleteRoleDialog } from "@/components/roles/delete-role-dialog";
import { RoleDetailSheet } from "@/components/roles/role-detail-sheet";
import { RoleFormDialog } from "@/components/roles/role-form-dialog";
import {
  RolesEmpty,
  RolesError,
  RolesLoading,
  RolesNoResults,
} from "@/components/roles/role-list-states";
import { RoleTable } from "@/components/roles/role-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { permissionModules, roles, totalPermissionCount } from "@/data/roles";
import type { Role } from "@/lib/types";

/**
 * Administration → Roles & Permissions.
 *
 * Static throughout: `src/data/roles.ts` is the only source, because FastAPI
 * has no roles endpoint yet. Filtering runs over that array, and saving or
 * deleting confirms with a toast without changing anything. The five list
 * states are selectable with `?state=` so each can be reviewed on its own.
 */

export type RolesListState =
  | "default"
  | "loading"
  | "empty"
  | "no-results"
  | "error";

const SEARCH_DEBOUNCE_MS = 300;

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const typeOptions = [
  { label: "System roles", value: "system" },
  { label: "Custom roles", value: "custom" },
];

/** Overlay currently on top of the list; only one is ever open. */
type Overlay =
  | { kind: "view"; role: Role }
  | { kind: "form"; mode: "create" | "edit"; role: Role | null }
  | { kind: "delete"; role: Role }
  | null;

export function RolesPageContent({
  state,
  search,
  status,
  type,
}: {
  state: RolesListState;
  search: string;
  status: string;
  type: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [overlay, setOverlay] = React.useState<Overlay>(null);
  const [searchInput, setSearchInput] = React.useState(search);

  // Keeps the field in sync when the URL changes from elsewhere, e.g. back
  // navigation or the no-results card clearing the filters.
  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);

      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only typing should reset the debounce timer — reacting to `search` or `updateParams` here would restart it every URL change.
  React.useEffect(() => {
    if (searchInput === search) return;

    const timeout = setTimeout(() => {
      updateParams({ q: searchInput || null });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = search.trim().toLowerCase();
  const visibleRoles = roles.filter((role) => {
    if (query && !`${role.name} ${role.key}`.toLowerCase().includes(query)) {
      return false;
    }
    if (status && role.status !== status) return false;
    if (type === "system" && !role.isSystem) return false;
    if (type === "custom" && role.isSystem) return false;
    return true;
  });

  function openCreate() {
    setOverlay({ kind: "form", mode: "create", role: null });
  }

  function openEdit(role: Role) {
    setOverlay({ kind: "form", mode: "edit", role });
  }

  /** A duplicate starts as a custom role with a distinct name to type over. */
  function openDuplicate(role: Role) {
    setOverlay({
      kind: "form",
      mode: "create",
      role: {
        ...role,
        id: `${role.id}-copy`,
        name: `${role.name} (copy)`,
        isSystem: false,
        assignees: [],
      },
    });
  }

  function clearFilters() {
    setSearchInput("");
    updateParams({ q: null, status: null, type: null });
  }

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description={`${roles.length} roles · ${totalPermissionCount} permissions across ${permissionModules.length} modules`}
        actions={
          <>
            <Button variant="outline">
              <DownloadIcon data-icon="inline-start" />
              Export
            </Button>
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              New role
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-full sm:w-[290px]">
          <InputGroupInput
            type="search"
            value={searchInput}
            placeholder="Search roles…"
            aria-label="Search roles"
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <FilterSelect
          label="All statuses"
          options={statusOptions}
          value={status || null}
          onValueChange={(value) => updateParams({ status: value })}
          className="w-[148px]"
        />
        <FilterSelect
          label="All role types"
          options={typeOptions}
          value={type || null}
          onValueChange={(value) => updateParams({ type: value })}
          className="w-[168px]"
        />
        <p className="ml-auto text-xs text-muted-foreground tabular-nums">
          Showing {visibleRoles.length} of {roles.length} roles
        </p>
      </div>

      {state === "loading" ? <RolesLoading /> : null}
      {state === "error" ? (
        <RolesError onRetry={() => updateParams({ state: null })} />
      ) : null}
      {state === "empty" ? <RolesEmpty onCreate={openCreate} /> : null}
      {/* `?state=no-results` carries no query of its own, so it borrows one. */}
      {state === "no-results" ||
      (state === "default" && visibleRoles.length === 0) ? (
        <RolesNoResults
          query={state === "no-results" ? search || "canvas" : search}
          totalRoles={roles.length}
          onClear={clearFilters}
        />
      ) : null}
      {state === "default" && visibleRoles.length > 0 ? (
        <RoleTable
          roles={visibleRoles}
          openRoleId={overlay?.kind === "view" ? overlay.role.id : null}
          onView={(role) => setOverlay({ kind: "view", role })}
          onEdit={openEdit}
          onDuplicate={openDuplicate}
          onDelete={(role) => setOverlay({ kind: "delete", role })}
        />
      ) : null}

      <RoleDetailSheet
        role={overlay?.kind === "view" ? overlay.role : null}
        open={overlay?.kind === "view"}
        onOpenChange={(open) => {
          if (!open) setOverlay(null);
        }}
        onEdit={openEdit}
        onDuplicate={openDuplicate}
        onDelete={(role) => setOverlay({ kind: "delete", role })}
      />

      <RoleFormDialog
        open={overlay?.kind === "form"}
        onOpenChange={(open) => {
          if (!open) setOverlay(null);
        }}
        mode={overlay?.kind === "form" ? overlay.mode : "create"}
        role={overlay?.kind === "form" ? overlay.role : null}
      />

      <DeleteRoleDialog
        role={overlay?.kind === "delete" ? overlay.role : null}
        open={overlay?.kind === "delete"}
        onOpenChange={(open) => {
          if (!open) setOverlay(null);
        }}
      />
    </>
  );
}
