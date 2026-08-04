import type { Metadata } from "next";

import {
  type RolesListState,
  RolesPageContent,
} from "@/components/roles/roles-page-content";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

const listStates = new Set<RolesListState>([
  "default",
  "loading",
  "empty",
  "no-results",
  "error",
]);

/**
 * Thin server shell: it owns the page metadata and reads the URL state, then
 * hands off to the client view.
 *
 * `state` is a review aid, not product behaviour — the page has no backend to
 * be loading from or failing against, so each list state is reachable at
 * `?state=loading`, `?state=empty`, `?state=no-results` or `?state=error`.
 */
export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string;
    q?: string;
    status?: string;
    type?: string;
  }>;
}) {
  const { state, q, status, type } = await searchParams;
  const listState = listStates.has(state as RolesListState)
    ? (state as RolesListState)
    : "default";

  return (
    <RolesPageContent
      state={listState}
      search={q ?? ""}
      status={status ?? ""}
      type={type ?? ""}
    />
  );
}
