/**
 * Canvassing module — public surface.
 *
 * Only the browser-safe pieces are re-exported here. The DAL is deliberately
 * left out: it reaches FastAPI and must be imported directly by Route Handlers
 * (`@/modules/canvassing/dal/...`) so it can never be pulled into a client
 * bundle through this barrel.
 */

export { fetchItemQuotations } from "@/modules/canvassing/api/client";
export { canvassingStatusOptions } from "@/modules/canvassing/constants";
export type {
  CanvassingEntry,
  CanvassingList,
  ItemQuotations,
  Quote,
} from "@/modules/canvassing/models/canvassing";
export {
  canvassingKeys,
  canvassingListQuery,
  itemQuotationsQuery,
} from "@/modules/canvassing/queries/canvassing.queries";
