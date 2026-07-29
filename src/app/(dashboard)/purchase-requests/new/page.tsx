import type { Metadata } from "next";

import { NewPurchaseRequestForm } from "@/components/purchase-requests/new-pr-form";

export const metadata: Metadata = {
  title: "New Purchase Request",
};

export default function NewPurchaseRequestPage() {
  return <NewPurchaseRequestForm />;
}
