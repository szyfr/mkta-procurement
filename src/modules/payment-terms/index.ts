/**
 * Payment terms module — public surface.
 *
 * Reference data only: the quotation form needs a `payment_term_id` and this
 * is where one comes from. There is no payment terms screen, so the module
 * carries no model, query or constants of its own — it produces `LookupOption`
 * for the shared picker.
 *
 * The DAL is deliberately left out: it reaches FastAPI and must be imported
 * directly by Route Handlers (`@/modules/payment-terms/dal/...`) so it can
 * never be pulled into a client bundle through this barrel.
 */

export { fetchPaymentTermOptions } from "@/modules/payment-terms/api/client";
export { paymentTermEndpoints } from "@/modules/payment-terms/api/endpoints";
export { paymentTermKeys } from "@/modules/payment-terms/queries/payment-term.queries";
