import { SettingsNav } from "@/components/settings/settings-nav";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and, for administrators, everyone's access"
      />

      <div className="grid gap-5 lg:grid-cols-4">
        <SettingsNav />
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
          {children}
        </div>
      </div>
    </>
  );
}
