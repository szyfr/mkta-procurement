import type { Metadata } from "next";

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
import { initials } from "@/lib/utils";
import { getCurrentUser } from "@/modules/auth/dal/auth.dal";
import { userName } from "@/modules/auth/models/session";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function AccountSettingsPage() {
  // The dashboard layout has already turned away anyone unauthenticated, so
  // this can read the session outright.
  const user = await getCurrentUser();
  const name = userName(user);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>My Account</CardTitle>
        <CardDescription>
          Your own profile. Every role sees this panel — it&apos;s personal, not
          administrative.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm">
          Change Photo
        </Button>
      </CardContent>

      <Separator />

      <CardContent>
        <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
          <Field>
            <FieldLabel htmlFor="full-name">Full Name</FieldLabel>
            <Input id="full-name" name="fullName" defaultValue={name} />
          </Field>

          {/* Role and department have no source on `/auth/me` — it carries a
              permission list and no organizational placement — so both stay
              blank rather than showing a value the backend never sent. */}
          <Field>
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <Input id="role" name="role" placeholder="—" readOnly />
          </Field>

          <Field>
            <FieldLabel htmlFor="company-email">Company Email</FieldLabel>
            <Input
              id="company-email"
              name="email"
              type="email"
              defaultValue={user.email}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="department">Department</FieldLabel>
            <Input id="department" name="department" placeholder="—" readOnly />
          </Field>
        </FieldGroup>
      </CardContent>

      <Separator />

      <CardContent>
        <FieldSet>
          <FieldLegend variant="label">Change Password</FieldLegend>
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
              <FieldLabel htmlFor="new-password">New Password</FieldLabel>
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
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
