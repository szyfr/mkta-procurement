"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  createDraftLine,
  LineItemsEditor,
} from "@/components/purchase-requests/line-items-editor";
import { LookupPicker } from "@/components/purchase-requests/lookup-picker";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  createPurchaseRequest,
  type DraftLineItem,
  fetchDepartmentOptions,
  type LookupOption,
} from "@/modules/purchase-requests";

/**
 * Create form. Owns all state for the request and its line items, then posts
 * once through the BFF.
 *
 * The requester is not collected here: authentication is out of scope, so the
 * BFF fills `requester_id` in server-side.
 */

const submissionChecklist = [
  "Items that need canvassing are routed there automatically; direct items let you pick a vendor now.",
  "Every item needs a quantity before submitting.",
  "Estimated costs are for approval routing only and aren't saved — the backend has no field for them yet.",
  "Attachments aren't wired up yet and won't be saved with the request.",
  "Every request is created as a draft — the backend doesn't distinguish saving from submitting yet.",
];

const priorities = [
  { label: "High", value: "high" },
  { label: "Normal", value: "normal" },
  { label: "Low", value: "low" },
] as const;

type Priority = (typeof priorities)[number]["value"];

export function NewPurchaseRequestForm() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState<LookupOption | null>(null);
  const [dateNeeded, setDateNeeded] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("normal");
  const [justification, setJustification] = React.useState("");
  const [lines, setLines] = React.useState<DraftLineItem[]>([
    createDraftLine("line-1"),
  ]);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadDepartments = React.useCallback(
    async ({ signal }: { signal: AbortSignal }) => {
      const result = await fetchDepartmentOptions(signal);
      // Departments are a short list, so they arrive in one page.
      return { options: result.options, page: { totalPages: 1 } };
    },
    [],
  );

  async function submit() {
    setError(null);

    if (!department) {
      setError("Pick a department before submitting.");
      return;
    }

    const items = lines
      .filter((line) => line.materialId !== null)
      .map((line) => ({
        materialId: line.materialId as string,
        quantity: line.quantity,
        vendorId: line.vendorId,
      }));

    if (items.length === 0) {
      setError("Add at least one item with a catalog entry selected.");
      return;
    }

    setSubmitting(true);

    try {
      const created = await createPurchaseRequest({
        title: title.trim(),
        departmentId: department.id,
        dateNeeded,
        priority,
        justification: justification.trim(),
        items,
      });

      router.push(`/purchase-requests/${created.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
      setSubmitting(false);
    }
  }

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
            {/*
              Both buttons perform the same POST: the backend accepts a status
              on create but never applies it, so every request lands as a draft.
              Called out in the checklist rather than hidden behind the labels.
            */}
            <Button variant="outline" onClick={submit} disabled={submitting}>
              Save as Draft
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <Spinner data-icon="inline-start" /> : null}
              Submit for Approval
            </Button>
          </>
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save this request</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder='e.g. "Q3 Production Line Lubricants"'
                  />
                  <FieldDescription>
                    Required — the backend has no auto-titling yet.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel>Department</FieldLabel>
                  <LookupPicker
                    value={department}
                    loadPage={loadDepartments}
                    placeholder="Select department"
                    searchPlaceholder="Search departments…"
                    ariaLabel="Department"
                    onSelect={setDepartment}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="date-needed">Date Needed</FieldLabel>
                  <Input
                    id="date-needed"
                    name="dateNeeded"
                    type="date"
                    value={dateNeeded}
                    onChange={(event) => setDateNeeded(event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel>Priority</FieldLabel>
                  <Select
                    items={priorities}
                    value={priority}
                    onValueChange={(value) => setPriority(value as Priority)}
                  >
                    <SelectTrigger
                      size="sm"
                      className="w-full"
                      aria-label="Priority"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {priorities.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor="justification">Justification</FieldLabel>
                  <Textarea
                    id="justification"
                    name="justification"
                    rows={4}
                    value={justification}
                    onChange={(event) => setJustification(event.target.value)}
                    placeholder="Explain why this purchase is needed…"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <LineItemsEditor lines={lines} onChange={setLines} />

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Attachments</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <label
                htmlFor="attachments"
                className="flex cursor-not-allowed flex-col items-center justify-center rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground"
              >
                Drop files here or click to upload
                <input
                  id="attachments"
                  name="attachments"
                  type="file"
                  multiple
                  disabled
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                File uploads aren&apos;t supported by the backend yet.
              </p>
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
              <CardTitle>Approval Routing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Approval routing isn&apos;t modelled on the backend yet.
                Requests are created as drafts and move on once their items are
                processed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
