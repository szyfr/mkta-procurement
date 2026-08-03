/**
 * Payment terms module — public surface.
 *
 * Two consumers share this module: the quotation form's picker (via
 * `fetchPaymentTermOptions`, producing `LookupOption`) and the Payment Terms
 * management screen (list/create/update/delete on the full model).
 *
 * The DAL is deliberately left out: it reaches FastAPI and must be imported
 * directly by Route Handlers (`@/modules/payment-terms/dal/...`) so it can
 * never be pulled into a client bundle through this barrel.
 */

export {
  createPaymentTerm,
  deletePaymentTerm,
  fetchPaymentTermOptions,
  updatePaymentTerm,
} from "@/modules/payment-terms/api/client";
export { paymentTermEndpoints } from "@/modules/payment-terms/api/endpoints";
export type {
  PaymentTerm,
  PaymentTermPayload,
} from "@/modules/payment-terms/models/payment-term";
export {
  paymentTermKeys,
  paymentTermListQuery,
} from "@/modules/payment-terms/queries/payment-term.queries";
