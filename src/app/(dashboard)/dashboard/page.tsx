import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Dashboard",
};

/**
 * The page stays a Server Component so it can keep exporting `metadata`; the
 * data-bearing part below it is the client view that owns the queries.
 */
export default function DashboardPage() {
    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Overview of your procurement workload"
                actions={
                    <Button
                        variant="outline"
                        render={<Link href="/purchase-requests/new" />}
                        nativeButton={false}
                    >
                        <PlusIcon data-icon="inline-start" />
                        New Purchase Request
                    </Button>
                }
            />

            <DashboardView />
        </>
    );
}
