"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
    createEmptyLine,
    type DraftLine,
    LineItemsEditor,
} from "@/components/purchase-requests/line-items-editor";
import { FilterSelect } from "@/components/shared/filter-select";
import { PageHeader } from "@/components/shared/page-header";
import { DataError } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
    useCreatePurchaseRequest,
    useSubmitPurchaseRequest,
} from "@/hooks/purchase-requests";
import { useDepartments } from "@/hooks/reference";
import { useSession } from "@/hooks/session";
import { todayIso } from "@/lib/format/dates";
import type { Priority } from "@/types";

const submissionChecklist = [
    'Toggle "Canvass?" off for an item to pick its vendor now and skip canvassing for that line; leave it on to route that item into the canvassing stage instead.',
    "Every item needs a quantity and unit before submitting.",
    "Items not in the catalog must be requested via Item Creation Request — this won't block submission, but sourcing will wait on approval.",
    "Estimated costs are for approval routing only; final price is set during canvassing.",
];

/**
 * The create form. The line items used to live in a component whose state the
 * page could not read, so nothing could be saved; the rows are lifted here and
 * submitted together with the request details.
 */
export function NewPurchaseRequestView() {
    const router = useRouter();
    const { data: session } = useSession();
    const { data: departments = [] } = useDepartments();

    const createRequest = useCreatePurchaseRequest();
    const submitRequest = useSubmitPurchaseRequest();

    const [lines, setLines] = React.useState<DraftLine[]>(() => [
        createEmptyLine("line-1"),
    ]);
    const [department, setDepartment] = React.useState<string | null>(null);
    // The backend requires a date needed on every request, so the field defaults
    // to today rather than starting empty and failing validation on first save.
    const [dateNeeded, setDateNeeded] = React.useState(() => todayIso());
    const [priority, setPriority] = React.useState<string | null>("Normal");
    const [title, setTitle] = React.useState("");
    const [justification, setJustification] = React.useState("");
    const [validationError, setValidationError] = React.useState<string | null>(
        null,
    );

    const isBusy = createRequest.isPending || submitRequest.isPending;

    function buildInput() {
        const items = lines.filter((line) => line.itemName !== null);

        if (!department) {
            setValidationError("Choose a department.");
            return null;
        }
        if (!dateNeeded) {
            setValidationError("Choose the date this is needed by.");
            return null;
        }
        if (items.length === 0) {
            setValidationError("Add at least one item with a name.");
            return null;
        }

        setValidationError(null);
        return {
            title: title.trim() ? title.trim() : null,
            department,
            dateNeeded,
            priority: (priority ?? "Normal") as Priority,
            justification: justification.trim() || null,
            items: items.map((line) => ({
                name: line.itemName as string,
                quantity: line.quantity,
                unit: line.unit,
                estimatedUnitCost: line.unitCost,
                vendor: line.sourcing === "direct" ? line.vendor : null,
                sourcing: line.sourcing,
                notInCatalog: line.sourcing === "pending-item-creation",
            })),
        };
    }

    function saveDraft() {
        const input = buildInput();
        if (!input) return;

        createRequest.mutate(
            { ...input, status: "draft" },
            {
                onSuccess: (created) =>
                    router.push(`/purchase-requests/${created.id}`),
            },
        );
    }

    function submitForApproval() {
        const input = buildInput();
        if (!input) return;

        // Create then submit: the API keeps the two steps distinct so a draft can
        // also be saved without entering the workflow.
        createRequest.mutate(
            { ...input, status: "draft" },
            {
                onSuccess: (created) =>
                    submitRequest.mutate(created.id, {
                        onSuccess: () =>
                            router.push(`/purchase-requests/${created.id}`),
                    }),
            },
        );
    }

    const error = createRequest.error ?? submitRequest.error;

    return (
        <>
            <PageHeader
                title="New Purchase Request"
                actions={
                    <>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => router.push("/purchase-requests")}
                            disabled={isBusy}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={saveDraft}
                            disabled={isBusy}
                        >
                            {createRequest.isPending &&
                            !submitRequest.isPending ? (
                                <>
                                    <Spinner data-icon="inline-start" />
                                    Saving
                                </>
                            ) : (
                                "Save as Draft"
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={submitForApproval}
                            disabled={isBusy}
                        >
                            {submitRequest.isPending ? (
                                <>
                                    <Spinner data-icon="inline-start" />
                                    Submitting
                                </>
                            ) : (
                                "Submit for Approval"
                            )}
                        </Button>
                    </>
                }
            />

            {validationError ? (
                <p className="text-xs text-destructive">{validationError}</p>
            ) : null}
            {error ? (
                <DataError error={error} title="Could not save this request" />
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
                                    <FieldLabel htmlFor="title">
                                        Title (optional)
                                    </FieldLabel>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder='e.g. "Q3 Production Line Lubricants"'
                                        value={title}
                                        onChange={(event) =>
                                            setTitle(event.target.value)
                                        }
                                    />
                                    <FieldDescription>
                                        Leave blank and we&apos;ll generate one
                                        from the items and department.
                                    </FieldDescription>
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="requester">
                                        Requester
                                    </FieldLabel>
                                    <Input
                                        id="requester"
                                        name="requester"
                                        value={
                                            session
                                                ? `${session.name} (you)`
                                                : ""
                                        }
                                        readOnly
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>Department</FieldLabel>
                                    <FilterSelect
                                        label="Select department"
                                        options={departments}
                                        className="w-full"
                                        value={department}
                                        onValueChange={setDepartment}
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="date-needed">
                                        Date Needed
                                    </FieldLabel>
                                    <Input
                                        id="date-needed"
                                        name="dateNeeded"
                                        type="date"
                                        value={dateNeeded}
                                        onChange={(event) =>
                                            setDateNeeded(event.target.value)
                                        }
                                    />
                                </Field>

                                <Field>
                                    <FieldLabel>Priority</FieldLabel>
                                    <FilterSelect
                                        label="Normal"
                                        options={["High", "Normal", "Low"]}
                                        className="w-full"
                                        value={priority}
                                        onValueChange={setPriority}
                                    />
                                </Field>

                                <Field className="sm:col-span-2">
                                    <FieldLabel htmlFor="justification">
                                        Justification
                                    </FieldLabel>
                                    <Textarea
                                        id="justification"
                                        name="justification"
                                        rows={4}
                                        placeholder="Explain why this purchase is needed…"
                                        value={justification}
                                        onChange={(event) =>
                                            setJustification(event.target.value)
                                        }
                                    />
                                </Field>
                            </FieldGroup>
                        </CardContent>
                    </Card>

                    <LineItemsEditor lines={lines} onLinesChange={setLines} />

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
                                Based on the request amount and department, this
                                PR will route to:
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
