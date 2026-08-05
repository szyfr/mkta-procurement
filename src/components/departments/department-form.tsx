"use client";

import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { CreateDepartmentDto } from "@/modules/departments";

/**
 * Title/description fields shared by the create and edit dialogs. Owns field
 * state and required-field validation; the caller owns the async submit
 * (create vs. update) and reports back `submitting`/`error`.
 */
export function DepartmentForm({
  initialValues,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: {
  initialValues?: CreateDepartmentDto;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (values: CreateDepartmentDto) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState(initialValues?.title ?? "");
  const [description, setDescription] = React.useState(
    initialValues?.description ?? "",
  );
  const [validationError, setValidationError] = React.useState<string | null>(
    null,
  );

  function handleSubmit() {
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }

    onSubmit({ title: title.trim(), description: description.trim() });
  }

  return (
    <>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save this department</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
        <Field data-invalid={validationError ? true : undefined}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder='e.g. "IT"'
            disabled={submitting}
            aria-invalid={validationError ? true : undefined}
          />
          {validationError ? <FieldError>{validationError}</FieldError> : null}
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder='e.g. "IT Department"'
            disabled={submitting}
          />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Spinner data-icon="inline-start" /> : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
