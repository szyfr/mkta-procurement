import type { Metadata } from "next";

import { CanvassingDetailView } from "@/components/canvassing/canvassing-detail-view";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    return { title: `Canvassing — ${id}` };
}

export default async function CanvassingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CanvassingDetailView id={id} />;
}
