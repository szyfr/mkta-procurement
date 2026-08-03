import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { VendorListView } from "@/components/vendors/vendor-list-view";

export const metadata: Metadata = {
  title: "Vendors",
};

/**
 * Thin server shell: it owns the page metadata and reads the URL state, then
 * hands off to the client view that fetches from the BFF. Read-only — vendors
 * are maintained upstream.
 */
export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const activePage = Math.max(Number(page) || 1, 1);

  return (
    <>
      <PageHeader
        title="Vendors"
        description="Suppliers available for canvassing and directly-sourced items"
      />

      <VendorListView page={activePage} />
    </>
  );
}
