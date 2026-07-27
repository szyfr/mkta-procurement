import { DashboardBreadcrumbs } from "@/components/dashboard/dashboard-breadcrumbs";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { NotificationsMenu } from "@/components/dashboard/notifications-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

/**
 * Sticky application header: sidebar toggle, breadcrumb trail, global search,
 * and notifications. The account menu lives in the sidebar footer.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <DashboardBreadcrumbs />
        <GlobalSearch className="ml-auto w-full max-w-xs sm:max-w-sm md:max-w-md" />
        <NotificationsMenu />
      </div>
    </header>
  );
}
