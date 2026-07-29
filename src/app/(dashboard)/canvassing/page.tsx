import type { Metadata } from "next";

import { CanvassingListView } from "@/components/canvassing/canvassing-list-view";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
    title: "Canvassing",
};

export default function CanvassingPage() {
    return (
        <>
            <PageHeader
                title="Canvassing"
                description="Items out for vendor quotation, grouped into batches"
            />

            <CanvassingListView />
        </>
    );
}
