import type { Metadata } from "next";

import { UsersView } from "@/components/settings/users-view";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Users & Roles",
};

export default function UsersSettingsPage() {
  return (
    <>
      <Alert>
        <AlertDescription>
          Visible only to the Administrator role. Everyone else manages their
          own profile under My Account instead.
        </AlertDescription>
      </Alert>

      <UsersView />
    </>
  );
}
