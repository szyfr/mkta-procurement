import type { Metadata } from "next";

import { AccountView } from "@/components/settings/account-view";

export const metadata: Metadata = {
  title: "My Account",
};

export default function AccountSettingsPage() {
  return <AccountView />;
}
