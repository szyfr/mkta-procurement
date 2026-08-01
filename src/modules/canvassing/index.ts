/**
 * Canvassing module — public surface.
 *
 * Only the browser-safe pieces are re-exported here. The DAL is deliberately
 * left out: it reaches FastAPI and must be imported directly by Route Handlers
 * (`@/modules/canvassing/dal/...`) so it can never be pulled into a client
 * bundle through this barrel.
 */

export { canvassingStatusOptions } from "@/modules/canvassing/constants";
export type {
  CanvassingEntry,
  CanvassingList,
  CanvassingQuotation,
  PurchaseRequestCanvassing,
  PurchaseRequestCanvassingItem,
} from "@/modules/canvassing/models/canvassing";
export {
  canvassingKeys,
  canvassingListQuery,
  purchaseRequestCanvassingQuery,
} from "@/modules/canvassing/queries/canvassing.queries";
