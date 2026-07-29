import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            {/* SidebarInset is the <main> landmark, so children go in a plain div.
          min-w-0 lets wide tables scroll inside their own container instead of
          stretching the flex track past the viewport. */}
            <SidebarInset className="min-w-0">
                <SiteHeader />
                <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
