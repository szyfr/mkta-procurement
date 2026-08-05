import type { Metadata } from "next";

import { RolesPageContent } from "@/components/roles/roles-page-content";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

/**
 * Thin server shell: it owns the page metadata and reads the URL state, then
 * hands off to the client view that fetches from the BFF.
 */
export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page, q } = await searchParams;
  const activePage = Math.max(Number(page) || 1, 1);

  return <RolesPageContent page={activePage} search={q ?? ""} />;
}
