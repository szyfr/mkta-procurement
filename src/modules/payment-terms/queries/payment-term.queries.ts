/**
 * Cache keys for the payment terms lookup.
 *
 * No `queryOptions` factory sits alongside them: the only consumer is the
 * shared `LookupPicker`, which builds its own `useInfiniteQuery` from a key
 * and a page loader.
 */

export const paymentTermKeys = {
  all: ["payment-terms"] as const,
  options: () => [...paymentTermKeys.all, "options"] as const,
};
