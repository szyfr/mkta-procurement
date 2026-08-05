"use client";

import * as React from "react";

import { createDraftLine } from "@/components/purchase-requests/line-items-editor";
import type {
  CreatePurchaseRequestPayload,
  DraftLineItem,
  LookupOption,
  PurchaseRequest,
} from "@/modules/purchase-requests";
import { priorityToDto } from "@/modules/purchase-requests";

/**
 * State and validation for the purchase request create and edit forms, which
 * collect exactly the same fields. The forms own only what differs: what
 * `submit` does with the result, and the copy around it.
 */

export const priorities = [
  { label: "High", value: "high" },
  { label: "Normal", value: "normal" },
  { label: "Low", value: "low" },
] as const;

export type PriorityValue = (typeof priorities)[number]["value"];

export interface PurchaseRequestFieldErrors {
  title?: string;
  department?: string;
  dateNeeded?: string;
  justification?: string;
  items?: string;
}

export interface PurchaseRequestFormState {
  title: string;
  setTitle: (title: string) => void;
  department: LookupOption | null;
  setDepartment: (department: LookupOption | null) => void;
  dateNeeded: string;
  setDateNeeded: (dateNeeded: string) => void;
  priority: PriorityValue;
  setPriority: (priority: PriorityValue) => void;
  justification: string;
  setJustification: (justification: string) => void;
  lines: DraftLineItem[];
  setLines: (lines: DraftLineItem[]) => void;
  fieldErrors: PurchaseRequestFieldErrors;
  clearFieldError: (field: keyof PurchaseRequestFieldErrors) => void;
  /** Seeds every field from an existing request, for the edit form. */
  seedFrom: (request: PurchaseRequest) => void;
  /**
   * Returns the payload when everything required is present, or null after
   * publishing the field errors that stopped it.
   */
  validate: () => CreatePurchaseRequestPayload | null;
}

export function usePurchaseRequestForm(): PurchaseRequestFormState {
  const [title, setTitle] = React.useState("");
  const [department, setDepartment] = React.useState<LookupOption | null>(null);
  const [dateNeeded, setDateNeeded] = React.useState("");
  const [priority, setPriority] = React.useState<PriorityValue>("normal");
  const [justification, setJustification] = React.useState("");
  const [lines, setLines] = React.useState<DraftLineItem[]>([
    createDraftLine("line-1"),
  ]);
  const [fieldErrors, setFieldErrors] =
    React.useState<PurchaseRequestFieldErrors>({});

  const clearFieldError = React.useCallback(
    (field: keyof PurchaseRequestFieldErrors) => {
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const seedFrom = React.useCallback((request: PurchaseRequest) => {
    setTitle(request.title ?? "");
    setDepartment({
      id: request.departmentId,
      // The detail join supplies the name; the id only shows if it missed.
      label: request.department ?? request.departmentId,
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
  }, []);

  function validate() {
    const items = lines
      .filter((line) => line.materialId !== null)
      .map((line) => ({
        materialId: line.materialId as string,
        quantity: line.quantity,
        vendorId: line.vendorId,
      }));

    const nextFieldErrors: PurchaseRequestFieldErrors = {};
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
    if (Object.keys(nextFieldErrors).length > 0) return null;

    return {
      title: title.trim(),
      departmentId: (department as LookupOption).id,
      dateNeeded,
      priority,
      justification: justification.trim(),
      items,
    };
  }

  return {
    title,
    setTitle,
    department,
    setDepartment,
    dateNeeded,
    setDateNeeded,
    priority,
    setPriority,
    justification,
    setJustification,
    lines,
    setLines,
    fieldErrors,
    clearFieldError,
    seedFrom,
    validate,
  };
}
