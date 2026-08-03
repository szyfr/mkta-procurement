import type { Metadata } from "next";

import { PaymentTermsPageContent } from "@/components/payment-terms/payment-terms-page-content";

export const metadata: Metadata = {
  title: "Payment Terms",
};

/**
 * Thin server shell: it owns the page metadata and reads the URL state, then
 * hands off to the client view that fetches from the BFF. Create and edit
 * happen inline via dialogs rather than dedicated routes.
 */
export default async function PaymentTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const activePage = Math.max(Number(page) || 1, 1);

  return <PaymentTermsPageContent page={activePage} />;
}
