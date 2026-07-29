"use client";

import * as React from "react";

import { DataError } from "@/components/shared/query-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useAccount, useUpdateAccount } from "@/hooks/settings";

function initials(name: string): string {
    return name
        .split(/\s+/)
        .map((part) => part.replace(/[^A-Za-z]/g, "").charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export function AccountView() {
    const { data: account, isPending, isError, error, refetch } = useAccount();
    const updateAccount = useUpdateAccount();
    const formRef = React.useRef<HTMLFormElement>(null);

    if (isError) {
        return <DataError error={error} onRetry={() => refetch()} />;
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        updateAccount.mutate({
            name: String(form.get("fullName") ?? ""),
            email: String(form.get("email") ?? ""),
        });
    }

    return (
        <Card>
            <CardHeader className="border-b">
                <CardTitle>My Account</CardTitle>
                <CardDescription>
                    Your own profile. Every role sees this panel — it&apos;s
                    personal, not administrative.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex items-center gap-4">
                <Avatar className="size-14">
                    <AvatarFallback>
                        {isPending ? "—" : initials(account.name)}
                    </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                    Change Photo
                </Button>
            </CardContent>

            <Separator />

            {isPending ? (
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }, (_, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
                        <Skeleton key={`field-${index}`} className="h-9" />
                    ))}
                </CardContent>
            ) : (
                // `key` remounts the form when the saved account changes, so the
                // uncontrolled inputs pick up the new defaults instead of keeping stale
                // values from the previous render.
                <form
                    key={account.name + account.email}
                    ref={formRef}
                    onSubmit={handleSubmit}
                >
                    <CardContent className="flex flex-col gap-4">
                        {updateAccount.isError ? (
                            <DataError
                                error={updateAccount.error}
                                title="Could not save"
                            />
                        ) : null}

                        <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
                            <Field>
                                <FieldLabel htmlFor="full-name">
                                    Full Name
                                </FieldLabel>
                                <Input
                                    id="full-name"
                                    name="fullName"
                                    defaultValue={account.name}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="role">Role</FieldLabel>
                                <Input
                                    id="role"
                                    name="role"
                                    defaultValue={account.role}
                                    readOnly
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="company-email">
                                    Company Email
                                </FieldLabel>
                                <Input
                                    id="company-email"
                                    name="email"
                                    type="email"
                                    defaultValue={account.email}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="department">
                                    Department
                                </FieldLabel>
                                <Input
                                    id="department"
                                    name="department"
                                    defaultValue={account.department}
                                    readOnly
                                />
                            </Field>
                        </FieldGroup>
                    </CardContent>

                    <Separator />

                    <CardContent>
                        <FieldSet>
                            <FieldLegend variant="label">
                                Change Password
                            </FieldLegend>
                            <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
                                <Field className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
                                    <FieldLabel htmlFor="current-password">
                                        Current Password
                                    </FieldLabel>
                                    <Input
                                        id="current-password"
                                        name="currentPassword"
                                        type="password"
                                        autoComplete="current-password"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="new-password">
                                        New Password
                                    </FieldLabel>
                                    <Input
                                        id="new-password"
                                        name="newPassword"
                                        type="password"
                                        autoComplete="new-password"
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="confirm-password">
                                        Confirm New Password
                                    </FieldLabel>
                                    <Input
                                        id="confirm-password"
                                        name="confirmPassword"
                                        type="password"
                                        autoComplete="new-password"
                                    />
                                </Field>
                            </FieldGroup>
                        </FieldSet>
                    </CardContent>

                    <CardFooter className="justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => formRef.current?.reset()}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            type="submit"
                            disabled={updateAccount.isPending}
                        >
                            {updateAccount.isPending ? (
                                <>
                                    <Spinner data-icon="inline-start" />
                                    Saving
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            )}
        </Card>
    );
}
