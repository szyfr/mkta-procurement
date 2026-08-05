"use client";

import Link from "next/link";
import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { DEFAULT_SIGNED_IN_PATH, useLogin } from "@/modules/auth";

/**
 * Sign-in form.
 *
 * It submits and nothing else — no token comes back for it to keep. The CSRF
 * cookie is primed and the credentials posted by `useLogin`, both against this
 * app's own origin, and the session arrives as an HttpOnly cookie the browser
 * stores on its own.
 */
export function LoginForm({
  className,
  redirectTo = DEFAULT_SIGNED_IN_PATH,
  ...props
}: React.ComponentProps<"div"> & { redirectTo?: string }) {
  const login = useLogin(redirectTo);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  // Stays true through the redirect: `router.replace` does not unmount this
  // form, and re-enabling the button on success would invite a second submit
  // against a session that already exists.
  const submitting = login.isPending || login.isSuccess;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setValidationError(null);

    if (!email.trim() || !password) {
      setValidationError("Enter your email and password.");
      return;
    }

    login.mutate({ email: email.trim(), password });
  }

  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <Card>
        <CardHeader>
          {/* The sign-in card carries the page heading. */}
          <CardTitle>
            <h1>Sign in</h1>
          </CardTitle>
          <CardDescription>
            Use your company email and password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {/* Whatever the BFF judged safe to show: a rejected credential,
                  a field FastAPI refused, or an unreachable backend. */}
              {login.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Couldn&apos;t sign you in</AlertTitle>
                  <AlertDescription>{login.error.message}</AlertDescription>
                </Alert>
              ) : null}

              <Field data-invalid={validationError ? true : undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@mkthemedattractions.com.ph"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={submitting}
                  aria-invalid={validationError ? true : undefined}
                  required
                />
              </Field>
              <Field data-invalid={validationError ? true : undefined}>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/login"
                    className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  disabled={submitting}
                  aria-invalid={validationError ? true : undefined}
                  required
                />
                {validationError ? (
                  <FieldError>{validationError}</FieldError>
                ) : null}
              </Field>
              {/* The "keep me signed in" checkbox is gone: the session lasts
                  exactly as long as the token FastAPI issues, and there is no
                  endpoint that would extend it. */}
              <Field>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Spinner data-icon="inline-start" /> : null}
                  {submitting ? "Signing in…" : "Sign In"}
                </Button>
                <FieldDescription className="text-center">
                  Trouble signing in? Contact your Administrator.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
