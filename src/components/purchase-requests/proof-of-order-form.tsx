"use client";

import * as React from "react";

import { DataError } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useRecordProofOfOrder } from "@/hooks/purchase-requests";

/**
 * Records the vendor's confirmation for an ordered item and marks it delivered.
 * Shown for the first item still awaiting proof.
 */
export function ProofOfOrderForm({
    purchaseRequestId,
    itemId,
    itemName,
}: {
    purchaseRequestId: string;
    itemId: string;
    itemName: string;
}) {
    const fileInputId = React.useId();
    const formRef = React.useRef<HTMLFormElement>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);

    const recordProof = useRecordProofOfOrder(purchaseRequestId);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);

        recordProof.mutate(
            {
                itemId,
                // Uploads would go to a storage service and return a handle; the name
                // is what the documents list renders.
                documentName: fileName ?? `${itemName} — proof of order`,
                deliveredOn: String(form.get("deliveryDate") ?? ""),
                vendorRef: (form.get("vendorRef") as string) || null,
            },
            { onSuccess: () => formRef.current?.reset() },
        );
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <Card>
                <CardHeader className="border-b">
                    <CardTitle className="text-xs">
                        Add Proof of Order &amp; Confirm Delivery — {itemName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {recordProof.isError ? (
                        <DataError
                            error={recordProof.error}
                            title="Could not save"
                        />
                    ) : null}

                    <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
                        <Field className="sm:col-span-2">
                            <FieldLabel htmlFor={fileInputId}>
                                Proof of Order (vendor confirmation, invoice, or
                                signed PO copy)
                            </FieldLabel>
                            <label
                                htmlFor={fileInputId}
                                className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground hover:bg-muted/50"
                            >
                                {fileName ??
                                    "Drop file here or click to upload"}
                                <input
                                    id={fileInputId}
                                    type="file"
                                    className="sr-only"
                                    onChange={(event) =>
                                        setFileName(
                                            event.currentTarget.files?.[0]
                                                ?.name ?? null,
                                        )
                                    }
                                />
                            </label>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="delivery-date">
                                Confirmed Delivery Date
                            </FieldLabel>
                            <Input
                                id="delivery-date"
                                name="deliveryDate"
                                type="date"
                                required
                            />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="vendor-ref">
                                Vendor Reference No.
                            </FieldLabel>
                            <Input
                                id="vendor-ref"
                                name="vendorRef"
                                placeholder="Optional"
                            />
                        </Field>
                    </FieldGroup>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => formRef.current?.reset()}
                        disabled={recordProof.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        type="submit"
                        disabled={recordProof.isPending}
                    >
                        {recordProof.isPending ? (
                            <>
                                <Spinner data-icon="inline-start" />
                                Saving
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
