import type { Metadata } from "next";

import { PurchaseRequestDetailView } from "@/components/purchase-requests/purchase-request-detail-view";

/**
 * The title is the request id, which is already in the route — no data access
 * needed, so metadata stays server-rendered while the body is client-fetched.
 *
 * `generateStaticParams` was removed along with the mock data it read: the
 * request list now lives in the database, and the page body is fetched by the
 * client, so there is nothing to prerender per id.
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    return { title: id };
}

export default async function PurchaseRequestDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PurchaseRequestDetailView id={id} />;
}
