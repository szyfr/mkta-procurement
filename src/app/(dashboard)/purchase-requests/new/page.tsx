import type { Metadata } from "next";
import Link from "next/link";

import { LineItemsEditor } from "@/components/purchase-requests/line-items-editor";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { departments } from "@/data/purchase-requests";
import { currentUser } from "@/data/users";

export const metadata: Metadata = {
  title: "New Purchase Request",
};

const submissionChecklist = [
  'Toggle "Canvass?" off for an item to pick its vendor now and skip canvassing for that line; leave it on to route that item into the canvassing stage instead.',
  "Every item needs a quantity and unit before submitting.",
  "Items not in the catalog must be requested via Item Creation Request — this won't block submission, but sourcing will wait on approval.",
  "Estimated costs are for approval routing only; final price is set during canvassing.",
];

export default function NewPurchaseRequestPage() {
  return (
    <>
      <PageHeader
        title="New Purchase Request"
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href="/purchase-requests" />}
              nativeButton={false}
            >
              Cancel
            </Button>
            <Button variant="outline" type="button">
              Save as Draft
            </Button>
            <Button
              render={<Link href="/purchase-requests/PR-2026-0117" />}
              nativeButton={false}
            >
              Submit for Approval
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="title">Title (optional)</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    placeholder='e.g. "Q3 Production Line Lubricants"'
                  />
                  <FieldDescription>
                    Leave blank and we&apos;ll generate one from the items and
                    department.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="requester">Requester</FieldLabel>
                  <Input
                    id="requester"
                    name="requester"
                    defaultValue={`${currentUser.name} (you)`}
                    readOnly
                  />
                </Field>

                <Field>
                  <FieldLabel>Department</FieldLabel>
                  <FilterSelect
                    label="Select department"
                    options={departments}
                    className="w-full"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="date-needed">Date Needed</FieldLabel>
                  <Input id="date-needed" name="dateNeeded" type="date" />
                </Field>

                <Field>
                  <FieldLabel>Priority</FieldLabel>
                  <FilterSelect
                    label="Normal"
                    options={["High", "Normal", "Low"]}
                    className="w-full"
                  />
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="justification">Justification</FieldLabel>
                  <Textarea
                    id="justification"
                    name="justification"
                    rows={4}
                    placeholder="Explain why this purchase is needed…"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <LineItemsEditor />

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <label
                htmlFor="attachments"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground hover:bg-muted/50"
              >
                Drop files here or click to upload
                <input
                  id="attachments"
                  name="attachments"
                  type="file"
                  multiple
                  className="sr-only"
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Before you submit</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs text-muted-foreground">
                {submissionChecklist.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval Routing (preview)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Based on the request amount and department, this PR will route
                to:
              </p>
              <p className="rounded-md border px-3 py-1.5 text-xs">
                Department Manager → Procurement Review
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
