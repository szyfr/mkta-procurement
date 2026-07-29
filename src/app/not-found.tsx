import { FileQuestionIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default function NotFound() {
    return (
        <main className="flex min-h-svh items-center justify-center p-6">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <FileQuestionIcon />
                    </EmptyMedia>
                    <EmptyTitle>Page not found</EmptyTitle>
                    <EmptyDescription>
                        That page doesn&apos;t exist. It may have been moved or
                        removed.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button
                        variant="outline"
                        render={<Link href="/dashboard" />}
                        nativeButton={false}
                    >
                        Back to Dashboard
                    </Button>
                </EmptyContent>
            </Empty>
        </main>
    );
}
