"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageXIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  MAX_ATTACHMENT_BYTES,
  QuotationAttachmentsField,
} from "@/components/canvassing/quotation-attachments-field";
import { QuotationItemPricingTable } from "@/components/canvassing/quotation-item-pricing-table";
import { LookupPicker } from "@/components/shared/lookup-picker";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorAlert } from "@/components/shared/query-states";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import type { SelectedOption } from "@/lib/lookup";
import { canvassingKeys, createQuotation } from "@/modules/canvassing";
import { fetchPaymentTerms, paymentTermKeys } from "@/modules/payment-terms";
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
 * Saving records the quote and nothing more; awarding a vendor is a separate
 * step on the comparison screen.
 */

/** Both pickers page through the BFF; only their fetcher differs. */
const loadVendorPage = fetchVendorOptions;
const loadPaymentTermPage = fetchPaymentTerms;

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

  const [vendor, setVendor] = React.useState<SelectedOption | null>(null);
  const [paymentTerm, setPaymentTerm] = React.useState<SelectedOption | null>(
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
        description: `${created.reference_no} is now in the comparison. Selecting a winner is a separate step.`,
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
    (item) => itemIds.includes(item._id) && item.is_needs_canvass,
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
    (sum, item) => sum + item.quantity * (Number(unitPrices[item._id]) || 0),
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
      item_id: item._id,
      unit_price: Number(unitPrices[item._id]),
    }));

    if (priced.some((price) => !Number.isFinite(price.unit_price))) {
      nextErrors.pricing = "Every item needs a unit price.";
    } else if (priced.some((price) => price.unit_price < 0)) {
      nextErrors.pricing = "Unit prices can't be negative.";
    }

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return null;

    return {
      payload: {
        reference_no: referenceNo.trim(),
        date,
        delivery_date: deliveryDate,
        // The picker's id is the vendor's Mongo `_id`, which is what the
        // upstream `vendor_id` wants — not the ERP field of the same name.
        vendor_id: vendor?.id ?? "",
        payment_term_id: paymentTerm?.id ?? "",
        item_pricing: priced,
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
                toOption={(record) => ({
                  id: record._id,
                  // Some synced vendors have a blank name; the number is the
                  // only other thing that identifies them.
                  label: record.name?.trim() || record.no,
                  hint: record.no,
                })}
                placeholder="Select vendor"
                searchPlaceholder="Search vendors…"
                ariaLabel="Vendor"
                aria-invalid={fieldErrors.vendor ? true : undefined}
                onSelect={(record) => {
                  setVendor({
                    id: record._id,
                    label: record.name?.trim() || record.no,
                  });
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
                toOption={(record) => ({
                  id: record._id,
                  // Seeded terms occasionally have a blank title; the
                  // description is the only other thing that names them.
                  label:
                    record.title?.trim() || record.description || record._id,
                  hint: record.description || undefined,
                })}
                placeholder="Select terms"
                searchPlaceholder="Search payment terms…"
                ariaLabel="Payment terms"
                aria-invalid={fieldErrors.paymentTerm ? true : undefined}
                onSelect={(record) => {
                  setPaymentTerm({
                    id: record._id,
                    label:
                      record.title?.trim() || record.description || record._id,
                  });
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

      <QuotationItemPricingTable
        items={items}
        unitPrices={unitPrices}
        pricingError={fieldErrors.pricing}
        total={total}
        onPriceChange={(itemId, value) => {
          setUnitPrices((current) => ({ ...current, [itemId]: value }));
          clearFieldError("pricing");
        }}
      />

      <QuotationAttachmentsField
        attachments={attachments}
        error={fieldErrors.attachments}
        onAdd={addAttachments}
        onRemove={(index) =>
          setAttachments((current) =>
            current.filter((_, position) => position !== index),
          )
        }
      />

      <Card>
        <CardContent className="text-xs text-muted-foreground">
          Saving adds this quote to the comparison for each item above. It does
          not pick a winner — awarding a vendor is a separate step.
        </CardContent>
      </Card>
    </>
  );
}
