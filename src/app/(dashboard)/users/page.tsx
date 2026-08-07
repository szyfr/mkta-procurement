import type { Metadata } from "next";

import { UsersPageContent } from "@/components/users/users-page-content";

export const metadata: Metadata = {
  title: "Users",
};

/**
 * Thin server shell: it owns the page metadata and reads the URL state, then
 * hands off to the client view that fetches from the BFF.
 */
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const activePage = Math.max(Number(page) || 1, 1);

  return <UsersPageContent page={activePage} />;
}
