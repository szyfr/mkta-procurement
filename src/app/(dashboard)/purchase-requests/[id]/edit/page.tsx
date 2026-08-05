import type { Metadata } from "next";

import { EditPurchaseRequestForm } from "@/components/purchase-requests/edit-pr-form";

export const metadata: Metadata = {
  title: "Edit Purchase Request",
};

export default async function EditPurchaseRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditPurchaseRequestForm id={id} />;
}
