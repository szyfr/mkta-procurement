import { BuildingIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { appIdentity } from "@/data/navigation";
import { REDIRECT_PARAM } from "@/modules/auth/constants";
import { getOptionalUser } from "@/modules/auth/dal/auth.dal";
import { safeRedirectPath } from "@/modules/auth/validation/redirect.validation";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Server shell for the sign-in screen.
 *
 * The "already signed in" check is made here rather than in `proxy.ts` on
 * purpose. The proxy can only see that a session cookie exists; bouncing on
 * that alone would trap anyone holding an expired one in a redirect loop with
 * the dashboard layout. Verifying the session upstream costs one request and
 * gives a definite answer.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params[REDIRECT_PARAM]);

  if (await getOptionalUser()) redirect(redirectTo);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BuildingIcon className="size-5" />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold">{appIdentity.name}</span>
            <span className="text-xs text-muted-foreground">
              {appIdentity.organization}
            </span>
          </div>
        </div>

        <LoginForm redirectTo={redirectTo} />

        <p className="text-center text-xs text-muted-foreground">
          © 2026 {appIdentity.organization}
        </p>
      </div>
    </div>
  );
}
