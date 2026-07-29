import { BuildingIcon } from "lucide-react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";
import { appIdentity } from "@/data/navigation";

export const metadata: Metadata = {
    title: "Sign in",
};

export default function LoginPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <BuildingIcon className="size-5" />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-semibold">
                            {appIdentity.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {appIdentity.organization}
                        </span>
                    </div>
                </div>

                <LoginForm />

                <p className="text-center text-xs text-muted-foreground">
                    © 2026 {appIdentity.organization}
                </p>
            </div>
        </div>
    );
}
