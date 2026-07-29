/**
 * Cross-layer types that belong to neither the DTO nor the model layer.
 */

/** Envelope every Purchase Requests BFF route returns. */
export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiErrorEnvelope {
  error: { message: string };
}

/** A line being edited in the create form, before it becomes a DTO. */
export interface DraftLineItem {
  key: string;
  materialId: string | null;
  materialName: string | null;
  unit: string | null;
  quantity: number;
  /** Derived from the material's `is_needs_canvass` flag, not chosen by hand. */
  sourcing: "direct" | "canvassing";
  vendorId: string | null;
  vendorName: string | null;
}
