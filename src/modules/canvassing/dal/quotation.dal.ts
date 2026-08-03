import { serverFetch } from "@/lib/api/fetcher";
import { assertObjectId } from "@/lib/api/object-id";
import type { ItemQuotationsDto } from "@/modules/canvassing/dto";
import { toItemQuotations } from "@/modules/canvassing/mappers/quotation.mapper";
import type { ItemQuotations } from "@/modules/canvassing/models/quotation";

/**
 * Quote reads against FastAPI. Server-side only, called from Route Handlers —
 * never from a component.
 */

const NOT_FOUND = "We couldn't find that item.";

/**
 * The quotes covering each of the given purchase request items.
 *
 * `items` repeats once per id upstream. The response is a bare array, not the
 * paginated envelope the other lists use, and it comes back in whatever order
 * the aggregation produced — callers that care about order should sort.
 */
export async function listItemQuotations(
  itemIds: string[],
): Promise<ItemQuotations[]> {
  // Asking for nothing is a legitimate state: a request whose items all source
  // directly has no ids to send.
  if (itemIds.length === 0) return [];

  for (const itemId of itemIds) assertObjectId(itemId, NOT_FOUND);

  const dtos = await serverFetch<ItemQuotationsDto[]>(
    "/canvassing/quotations",
    {
      query: { items: itemIds },
    },
  );

  return dtos.map(toItemQuotations);
}
