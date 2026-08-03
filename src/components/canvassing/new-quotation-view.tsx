"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageXIcon, PaperclipIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { LookupPicker } from "@/components/shared/lookup-picker";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorAlert } from "@/components/shared/query-states";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import type { LookupOption } from "@/lib/lookup";
import { formatCurrency } from "@/lib/utils";
import { canvassingKeys, createQuotation } from "@/modules/canvassing";
import {
  fetchPaymentTermOptions,
  paymentTermKeys,
} from "@/modules/payment-terms";
import {
  fetchVendorOptions,
  purchaseRequestDetailQuery,
  purchaseRequestKeys,
} from "@/modules/purchase-requests";

/**
 * Captures one vendor's quote for the items selected on the canvassing screen.
 *
 * A quote is per-vendor, not per-item: one reference number, one delivery
 * date and one set of payment terms cover every item it prices, which is why
 * the items arrive as a list and only their unit prices vary.
 *
 * Saving records the quote and nothing more. Awarding is a separate endpoint
 * that isn't wired up, so the comparison table's winner selection stays
 * disabled — see `canvassing.dal.ts` for why.
 */

/** Both pickers page through the BFF; only their fetcher differs. */
const loadVendorPage = ({
  page,
  pageSize,
  search,
  signal,
}: {
  page: number;
  pageSize: number;
  search: string;
  signal: AbortSignal;
}) => fetchVendorOptions({ page, pageSize, search, signal });

const loadPaymentTermPage = ({
  page,
  pageSize,
  search,
  signal,
}: {
  page: number;
  pageSize: number;
  search: string;
  signal: AbortSignal;
}) => fetchPaymentTermOptions({ page, pageSize, search, signal });

/**
 * The backend accepts any file at any size and stores it straight to S3, so
 * the only limits that exist are the ones enforced here.
 */
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ACCEPTED_ATTACHMENTS =
  ".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.csv";

interface FieldErrors {
  vendor?: string;
  referenceNo?: string;
  date?: string;
  deliveryDate?: string;
  paymentTerm?: string;
  pricing?: string;
  attachments?: string;
}

export function NewQuotationView({
  purchaseRequestId,
  itemIds,
}: {
  purchaseRequestId: string;
  itemIds: string[];
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Already cached by the canvassing screen the user came from.
  const {
    data: request,
    isPending,
    isError,
    error,
  } = useQuery(purchaseRequestDetailQuery(purchaseRequestId));

  const [vendor, setVendor] = React.useState<LookupOption | null>(null);
  const [paymentTerm, setPaymentTerm] = React.useState<LookupOption | null>(
    null,
  );
  const [referenceNo, setReferenceNo] = React.useState("");
  const [date, setDate] = React.useState("");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [unitPrices, setUnitPrices] = React.useState<Record<string, string>>(
    {},
  );
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  const canvassingHref = `/purchase-requests/${purchaseRequestId}/canvassing`;

  const {
    mutate: save,
    isPending: saving,
    error: saveError,
  } = useMutation({
    mutationFn: createQuotation,
    onSuccess: (created) => {
      toast.add({
        title: "Quote saved",
        description: `${created.referenceNo} is now in the comparison. Selecting a winner is a separate step.`,
        type: "success",
      });

      // Covers both the comparison and the canvassing list, whose status is
      // derived from whether an item has any quotes at all.
      queryClient.invalidateQueries({ queryKey: canvassingKeys.all });
      queryClient.invalidateQueries({
        queryKey: purchaseRequestKeys.detail(purchaseRequestId),
      });

      router.push(canvassingHref);
    },
  });

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Add Vendor Quote" />
        <ErrorAlert title="Couldn't load this purchase request" error={error} />
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </>
    );
  }

  /**
   * The URL only proposes items; the request decides. Anything sourced
   * directly is dropped, because a quote against it would save and then never
   * appear in the comparison.
   */
  const items = request.items.filter(
    (item) => itemIds.includes(item.id) && item.sourcing === "canvassing",
  );

  if (items.length === 0) {
    return (
      <>
        <PageHeader
          title="Add Vendor Quote"
          description={request.no}
          actions={
            <Button
              variant="outline"
              render={<Link href={canvassingHref} />}
              nativeButton={false}
            >
              Back to canvassing
            </Button>
          }
        />
        <EmptyState
          icon={<PackageXIcon />}
          title="Nothing to quote"
          description="Pick one or more items routed to canvassing on the canvassing screen, then start a quote from there."
        />
      </>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.quantity * (Number(unitPrices[item.id]) || 0),
    0,
  );

  function validate() {
    const nextErrors: FieldErrors = {};

    if (!vendor) nextErrors.vendor = "Pick the vendor this quote came from.";
    if (!referenceNo.trim())
      nextErrors.referenceNo = "Quote reference number is required.";
    if (!date) nextErrors.date = "Quote date is required.";
    if (!deliveryDate) nextErrors.deliveryDate = "Delivery date is required.";
    if (!paymentTerm) nextErrors.paymentTerm = "Payment terms are required.";

    const priced = items.map((item) => ({
      itemId: item.id,
      unitPrice: Number(unitPrices[item.id]),
    }));

    if (priced.some((price) => !Number.isFinite(price.unitPrice))) {
      nextErrors.pricing = "Every item needs a unit price.";
    } else if (priced.some((price) => price.unitPrice < 0)) {
      nextErrors.pricing = "Unit prices can't be negative.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return null;

    return {
      payload: {
        referenceNo: referenceNo.trim(),
        date,
        deliveryDate,
        // `LookupOption.id` is the vendor's Mongo `_id`, which is what the
        // upstream `vendor_id` wants — not the ERP field of the same name.
        vendorId: vendor?.id ?? "",
        paymentTermId: paymentTerm?.id ?? "",
        itemPricing: priced,
      },
      attachments,
    };
  }

  function submit() {
    const input = validate();
    if (input) save(input);
  }

  function addAttachments(files: FileList | null) {
    if (!files || files.length === 0) return;

    const picked = Array.from(files);
    const oversized = picked.filter((file) => file.size > MAX_ATTACHMENT_BYTES);

    setAttachments((current) => [
      ...current,
      ...picked.filter((file) => file.size <= MAX_ATTACHMENT_BYTES),
    ]);

    setFieldErrors((current) => ({
      ...current,
      attachments:
        oversized.length > 0
          ? `${oversized.map((file) => file.name).join(", ")} — each file must be under 10 MB.`
          : undefined,
    }));
  }

  return (
    <>
      <PageHeader
        title="Add Vendor Quote"
        description={`${request.no} · ${items.length} ${
          items.length === 1 ? "item" : "items"
        } priced by one vendor`}
        actions={
          <>
            <Button
              variant="outline"
              disabled={saving}
              render={<Link href={canvassingHref} />}
              nativeButton={false}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving…" : "Save Quote"}
            </Button>
          </>
        }
      />

      {saveError ? (
        <ErrorAlert title="Couldn't save this quote" error={saveError} />
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Vendor &amp; Quote Details</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup className="sm:grid sm:grid-cols-2 sm:gap-4">
            <Field
              className="sm:col-span-2"
              data-invalid={fieldErrors.vendor ? true : undefined}
            >
              <FieldLabel>Vendor</FieldLabel>
              <LookupPicker
                value={vendor}
                queryKey={purchaseRequestKeys.vendorOptions()}
                loadPage={loadVendorPage}
                placeholder="Select vendor"
                searchPlaceholder="Search vendors…"
                ariaLabel="Vendor"
                aria-invalid={fieldErrors.vendor ? true : undefined}
                onSelect={(option) => {
                  setVendor(option);
                  clearFieldError("vendor");
                }}
              />
              {fieldErrors.vendor ? (
                <FieldError>{fieldErrors.vendor}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={fieldErrors.referenceNo ? true : undefined}>
              <FieldLabel htmlFor="quote-ref">Quote Reference No.</FieldLabel>
              <Input
                id="quote-ref"
                name="referenceNo"
                value={referenceNo}
                placeholder="Vendor's quotation number"
                aria-invalid={fieldErrors.referenceNo ? true : undefined}
                onChange={(event) => {
                  setReferenceNo(event.target.value);
                  clearFieldError("referenceNo");
                }}
              />
              {fieldErrors.referenceNo ? (
                <FieldError>{fieldErrors.referenceNo}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={fieldErrors.paymentTerm ? true : undefined}>
              <FieldLabel>Payment Terms</FieldLabel>
              <LookupPicker
                value={paymentTerm}
                queryKey={paymentTermKeys.options()}
                loadPage={loadPaymentTermPage}
                placeholder="Select terms"
                searchPlaceholder="Search payment terms…"
                ariaLabel="Payment terms"
                aria-invalid={fieldErrors.paymentTerm ? true : undefined}
                onSelect={(option) => {
                  setPaymentTerm(option);
                  clearFieldError("paymentTerm");
                }}
              />
              {fieldErrors.paymentTerm ? (
                <FieldError>{fieldErrors.paymentTerm}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={fieldErrors.date ? true : undefined}>
              <FieldLabel htmlFor="quote-date">Quote Date</FieldLabel>
              <Input
                id="quote-date"
                name="date"
                type="date"
                value={date}
                aria-invalid={fieldErrors.date ? true : undefined}
                onChange={(event) => {
                  setDate(event.target.value);
                  clearFieldError("date");
                }}
              />
              {fieldErrors.date ? (
                <FieldError>{fieldErrors.date}</FieldError>
              ) : null}
            </Field>

            <Field data-invalid={fieldErrors.deliveryDate ? true : undefined}>
              <FieldLabel htmlFor="delivery-date">Delivery Date</FieldLabel>
              <Input
                id="delivery-date"
                name="deliveryDate"
                type="date"
                value={deliveryDate}
                aria-invalid={fieldErrors.deliveryDate ? true : undefined}
                onChange={(event) => {
                  setDeliveryDate(event.target.value);
                  clearFieldError("deliveryDate");
                }}
              />
              <FieldDescription>
                A date, not a lead time — the backend stores no estimate.
              </FieldDescription>
              {fieldErrors.deliveryDate ? (
                <FieldError>{fieldErrors.deliveryDate}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
          <CardTitle>Item Pricing</CardTitle>
          <span className="text-xs text-muted-foreground">
            {items.length === 1
              ? "The item this quote covers"
              : "Every item this quote covers"}
          </span>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="pl-4">
                  Item
                </TableHead>
                <TableHead scope="col">Qty</TableHead>
                <TableHead scope="col">Unit Price</TableHead>
                <TableHead scope="col" className="pr-4">
                  Line Total
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const unitPrice = Number(unitPrices[item.id]) || 0;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="pl-4">{item.name}</TableCell>
                    <TableCell>
                      {item.quantity}
                      {item.unit ? ` ${item.unit}` : ""}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={unitPrices[item.id] ?? ""}
                        placeholder="0.00"
                        aria-label={`Unit price for ${item.name}`}
                        aria-invalid={fieldErrors.pricing ? true : undefined}
                        className="h-7 w-28"
                        onChange={(event) => {
                          setUnitPrices((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }));
                          clearFieldError("pricing");
                        }}
                      />
                    </TableCell>
                    <TableCell className="pr-4">
                      {formatCurrency(item.quantity * unitPrice, true)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="justify-between gap-2">
          {fieldErrors.pricing ? (
            <FieldError>{fieldErrors.pricing}</FieldError>
          ) : (
            <span />
          )}
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Quote Amount</p>
            <p className="text-lg font-semibold">
              {formatCurrency(total, true)}
            </p>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Quotation Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <label
            htmlFor="attachments"
            className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground hover:bg-muted/50"
          >
            Upload the vendor&apos;s quotation (PDF, image, or spreadsheet)
            <input
              id="attachments"
              name="attachments"
              type="file"
              multiple
              accept={ACCEPTED_ATTACHMENTS}
              className="sr-only"
              onChange={(event) => {
                addAttachments(event.target.files);
                // Lets the same file be re-picked after it's removed.
                event.target.value = "";
              }}
            />
          </label>

          {fieldErrors.attachments ? (
            <FieldError>{fieldErrors.attachments}</FieldError>
          ) : null}

          {attachments.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {attachments.map((file, index) => (
                <li
                  key={`${file.name}-${file.lastModified}`}
                  className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs"
                >
                  <PaperclipIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {Math.max(1, Math.round(file.size / 1024))} KB
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter((_, position) => position !== index),
                      )
                    }
                  >
                    <XIcon />
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="text-xs text-muted-foreground">
          Saving adds this quote to the comparison for each item above. It does
          not pick a winner — awarding a vendor is a separate step.
        </CardContent>
      </Card>
    </>
  );
}
