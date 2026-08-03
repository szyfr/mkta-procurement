import type { Metadata } from "next";

import { DepartmentsPageContent } from "@/components/departments/departments-page-content";

export const metadata: Metadata = {
  title: "Departments",
};

/**
 * Thin server shell: it owns the page metadata and reads the URL state, then
 * hands off to the client view that fetches from the BFF. Create and edit
 * happen inline via dialogs rather than dedicated routes.
 */
export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const activePage = Math.max(Number(page) || 1, 1);

  return <DepartmentsPageContent page={activePage} />;
}
