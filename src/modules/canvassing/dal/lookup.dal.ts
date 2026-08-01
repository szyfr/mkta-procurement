import { fetchAll } from "@/lib/api/pagination";
import type { VendorDto } from "@/modules/canvassing/dto";
import type { NameLookup } from "@/modules/canvassing/mappers/canvassing.mapper";
import { toVendorLookup } from "@/modules/canvassing/mappers/canvassing.mapper";

/**
 * Reference data reads. Server-side only — this talks to FastAPI, never to
 * the BFF.
 *
 * Quotations store `vendor_id` but the endpoint joins no vendor, so resolving
 * a name means pulling the full (small) collection and indexing it — the same
 * approach `purchase-requests/dal/lookup.dal.ts` takes, kept as its own
 * memoized cache here rather than shared, to keep the module boundary real.
 */

const LOOKUP_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  value: Promise<NameLookup>;
  expiresAt: number;
}

const lookupCache = new Map<string, CacheEntry>();

function memoizeLookup(key: string, load: () => Promise<NameLookup>) {
  const cached = lookupCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = load().catch((error) => {
    // Never cache a failure — the next caller should retry.
    lookupCache.delete(key);
    throw error;
  });

  lookupCache.set(key, { value, expiresAt: Date.now() + LOOKUP_TTL_MS });

  return value;
}

export function getVendorLookup() {
  return memoizeLookup("vendors", async () =>
    toVendorLookup(await fetchAll<VendorDto>("/vendors")),
  );
}
