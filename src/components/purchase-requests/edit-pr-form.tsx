"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  createDraftLine,
  LineItemsEditor,
} from "@/components/purchase-requests/line-items-editor";
import {
  LookupPicker,
  singlePageLoader,
} from "@/components/purchase-requests/lookup-picker";
import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  type DraftLineItem,
  fetchDepartmentOptions,
  type LookupOption,
  priorityToDto,
  purchaseRequestDetailQuery,
  purchaseRequestKeys,
  type UpdatePurchaseRequestPayload,
  updatePurchaseRequest,
} from "@/modules/purchase-requests";

/**
 * Edit form for an existing request. Fetches the request once on mount, then
 * behaves like the create form — same fields, same line item editor — but
 * PUTs the changes back instead of POSTing a new request.
 */

const submissionChecklist = [
  "Items that need canvassing are routed there automatically; direct items let you pick a vendor now.",
  "Every item needs a quantity before submitting.",
  "Estimated costs are for approval routing only and aren't saved — the backend has no field for them yet.",
  "Attachments aren't wired up yet and won't be saved with the request.",
];

/** Departments are a short list, so they arrive in one page. */
const loadDepartmentPage = singlePageLoader(fetchDepartmentOptions);

const priorities = [
  { label: "High", value: "high" },
  { label: "Normal", value: "normal" },
  { label: "Low", value: "low" },
] as const;

type Priority = (typeof priorities)[number]["value"];

interface FieldErrors {
  title?: string;
  department?: string;
  dateNeeded?: string;
  justification?: string;
  items?: string;
}

function EditFormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 w-full lg:col-span-2" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function EditPurchaseRequestForm({ id }: { id: string }) {
  const router = useRouter();

  const {
    data: request,
    isPending: loading,
    isError,
    error: loadError,
  } = useQuery(purchaseRequestDetailQuery(id));

  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState<LookupOption | null>(null);
  const [dateNeeded, setDateNeeded] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("normal");
  const [justification, setJustification] = React.useState("");
  const [lines, setLines] = React.useState<DraftLineItem[]>([
    createDraftLine("line-1"),
  ]);

  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const queryClient = useQueryClient();

  const {
    mutate: save,
    isPending: saving,
    error,
    variables,
  } = useMutation({
    mutationFn: (payload: UpdatePurchaseRequestPayload) =>
      updatePurchaseRequest(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(purchaseRequestKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: purchaseRequestKeys.lists() });
      router.push(`/purchase-requests/${updated.id}`);
    },
  });

  // One mutation drives both buttons; which is busy comes from the payload it
  // was called with, keeping the two spinners independent as before.
  const savingChanges = saving && variables?.status === undefined;
  const submittingForApproval = saving && variables?.status === "pending";

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  /**
   * Seeds the form from the fetched request, once per request. The ref matters:
   * these fields are editable from here on, so a later background refetch
   * handing back a new object must not overwrite what the user has typed.
   */
  const seededRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!request || seededRef.current === request.id) return;
    seededRef.current = request.id;

    setTitle(request.title ?? "");
    setDepartment({
      id: request.departmentId,
      label: request.department,
    });
    setDateNeeded(request.dateNeededValue);
    setPriority(priorityToDto[request.priority]);
    setJustification(request.justification);
    setLines(
      request.items.length > 0
        ? request.items.map((item) => ({
            key: item.id,
            materialId: item.materialId,
            materialName: item.name,
            unit: item.unit,
            quantity: item.quantity,
            unitCost: item.estimatedUnitCost,
            sourcing: item.sourcing,
            vendorId: item.vendorId,
            vendorName: item.vendor,
          }))
        : [createDraftLine("line-1")],
    );
  }, [request]);

  function submitForm(status?: "pending") {
    const items = lines
      .filter((line) => line.materialId !== null)
      .map((line) => ({
        materialId: line.materialId as string,
        quantity: line.quantity,
        vendorId: line.vendorId,
      }));

    const nextFieldErrors: FieldErrors = {};
    if (!title.trim()) nextFieldErrors.title = "Title is required.";
    if (!department)
      nextFieldErrors.department = "Pick a department before submitting.";
    if (!dateNeeded) nextFieldErrors.dateNeeded = "Date needed is required.";
    if (!justification.trim())
      nextFieldErrors.justification = "Justification is required.";
    if (items.length === 0)
      nextFieldErrors.items =
        "Add at least one item with a catalog entry selected.";

    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    save({
      title: title.trim(),
      departmentId: (department as LookupOption).id,
      dateNeeded,
      priority,
      justification: justification.trim(),
      items,
      ...(status === undefined ? {} : { status }),
    });
  }

  if (isError) {
    return (
      <>
        <PageHeader
          title="Edit Purchase Request"
          actions={
            <Button
              variant="outline"
              render={<Link href="/purchase-requests" />}
              nativeButton={false}
            >
              Back to Purchase Requests
            </Button>
          }
        />
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load this purchase request</AlertTitle>
          <AlertDescription>
            {loadError instanceof Error
              ? loadError.message
              : "Something went wrong."}
          </AlertDescription>
        </Alert>
      </>
    );
  }

  if (loading) return <EditFormSkeleton />;

  return (
    <>
      <PageHeader
        title="Edit Purchase Request"
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href={`/purchase-requests/${id}`} />}
              nativeButton={false}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => submitForm()}
              disabled={savingChanges || submittingForApproval}
            >
              {savingChanges ? <Spinner data-icon="inline-start" /> : null}
              Save Changes
            </Button>
            <Button
              onClick={() => submitForm("pending")}
              disabled={savingChanges || submittingForApproval}
            >
              {submittingForApproval ? (
                <Spinner data-icon="inline-start" />
              ) : null}
              Submit for Approval
            </Button>
          </>
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save this request</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Something went wrong."}
          </AlertDescription>
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
                <Field
                  className="sm:col-span-2"
                  data-invalid={fieldErrors.title ? true : undefined}
                >
                  <FieldLabel htmlFor="title">Title</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      clearFieldError("title");
                    }}
                    placeholder='e.g. "Q3 Production Line Lubricants"'
                    aria-invalid={fieldErrors.title ? true : undefined}
                  />
                  <FieldDescription>
                    Required — the backend has no auto-titling yet.
                  </FieldDescription>
                  {fieldErrors.title ? (
                    <FieldError>{fieldErrors.title}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={fieldErrors.department ? true : undefined}>
                  <FieldLabel>Department</FieldLabel>
                  <LookupPicker
                    value={department}
                    queryKey={purchaseRequestKeys.departmentOptions()}
                    loadPage={loadDepartmentPage}
                    placeholder="Select department"
                    searchPlaceholder="Search departments…"
                    ariaLabel="Department"
                    aria-invalid={fieldErrors.department ? true : undefined}
                    onSelect={(option) => {
                      setDepartment(option);
                      clearFieldError("department");
                    }}
                  />
                  {fieldErrors.department ? (
                    <FieldError>{fieldErrors.department}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={fieldErrors.dateNeeded ? true : undefined}>
                  <FieldLabel htmlFor="date-needed">Date Needed</FieldLabel>
                  <Input
                    id="date-needed"
                    name="dateNeeded"
                    type="date"
                    value={dateNeeded}
                    onChange={(event) => {
                      setDateNeeded(event.target.value);
                      clearFieldError("dateNeeded");
                    }}
                    aria-invalid={fieldErrors.dateNeeded ? true : undefined}
                  />
                  {fieldErrors.dateNeeded ? (
                    <FieldError>{fieldErrors.dateNeeded}</FieldError>
                  ) : null}
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

                <Field
                  className="sm:col-span-2"
                  data-invalid={fieldErrors.justification ? true : undefined}
                >
                  <FieldLabel htmlFor="justification">Justification</FieldLabel>
                  <Textarea
                    id="justification"
                    name="justification"
                    rows={4}
                    value={justification}
                    onChange={(event) => {
                      setJustification(event.target.value);
                      clearFieldError("justification");
                    }}
                    placeholder="Explain why this purchase is needed…"
                    aria-invalid={fieldErrors.justification ? true : undefined}
                  />
                  {fieldErrors.justification ? (
                    <FieldError>{fieldErrors.justification}</FieldError>
                  ) : null}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <LineItemsEditor
            lines={lines}
            onChange={(next) => {
              setLines(next);
              clearFieldError("items");
            }}
            error={fieldErrors.items}
          />

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
                Requests move on once their items are processed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
