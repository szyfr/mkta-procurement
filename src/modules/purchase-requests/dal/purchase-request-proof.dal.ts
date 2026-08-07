import { serverFetch } from "@/lib/api/fetcher";
import {
  buildPurchaseRequestProofForm,
  type CreatePurchaseRequestProofDto,
} from "@/modules/purchase-requests/dto";
import type { PurchaseRequestProof } from "@/modules/purchase-requests/models/purchase-request-proof";

/** Server-side only, called from the Route Handler. */
export function createPurchaseRequestProof(
  payload: CreatePurchaseRequestProofDto,
  attachments: File[] = [],
): Promise<PurchaseRequestProof> {
  const form = buildPurchaseRequestProofForm(payload, attachments);

  // Trailing slash required: this route is mounted as `router.post("/")`
  // under the `/purchase-request-proofs` prefix, so a bare path 307s and the
  // redirect can drop the multipart body.
  return serverFetch<PurchaseRequestProof>("/purchase-request-proofs/", {
    method: "POST",
    body: form,
  });
}
