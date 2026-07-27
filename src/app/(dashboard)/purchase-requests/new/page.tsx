import type { Metadata } from "next";

import { NewPurchaseRequestView } from "@/components/purchase-requests/new-purchase-request-view";

export const metadata: Metadata = {
  title: "New Purchase Request",
};

export default function NewPurchaseRequestPage() {
  return <NewPurchaseRequestView />;
}
