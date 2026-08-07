export interface CreatePurchaseRequestProofDto {
  /** `YYYY-MM-DD`. FastAPI parses this as a date and rejects a time component. */
  delivery_date: string;
  vendor_reference_no: string;
  purchase_request_item_ids: string[];
}

/**
 * `purchase_request_item_ids` and `attachments` are both repeated form parts
 * under the same field name — FastAPI reads them back as `list[str]` /
 * `list[UploadFile]` via `Form(...)`/`File(...)`, not a JSON-stringified part.
 */
export function buildPurchaseRequestProofForm(
  payload: CreatePurchaseRequestProofDto,
  attachments: File[] = [],
): FormData {
  const form = new FormData();

  form.set("delivery_date", payload.delivery_date);
  form.set("vendor_reference_no", payload.vendor_reference_no);

  for (const itemId of payload.purchase_request_item_ids) {
    form.append("purchase_request_item_ids", itemId);
  }

  for (const attachment of attachments) {
    form.append("attachments", attachment, attachment.name);
  }

  return form;
}
