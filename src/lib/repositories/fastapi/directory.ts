import "server-only";

import type { CatalogItem, CatalogItemPage } from "@/types";

import type { FastApiClient } from "./client";

/**
 * Reference data, indexed both ways.
 *
 * The DTO contract the UI is built against speaks in names — `department:
 * "Procurement"`, `vendor: "Acme"`, `item.name: "Hex Bolt"`. Mongo speaks in
 * ObjectIds. Something has to hold both directions, and doing it per-request
 * would mean paging through 1,900+ materials on every keystroke.
 *
 * So this module owns the whole reference set: it pages each collection in
 * once, indexes it by id and by name, and hands out lookups. The catalog
 * picker's infinite scroll is served from the same snapshot, which is why
 * scrolling costs no upstream calls at all.
 */

/** The upstream caps `page_size` at 100 (`Query(..., le=100)`). */
const MAX_PAGE_SIZE = 100;

/**
 * Long enough that a burst of requests shares one warm-up, short enough that a
 * Business Central sync shows up without a restart.
 */
const TTL_MS = 5 * 60 * 1000;

/** Stops a runaway `total_items` from paging forever. */
const MAX_PAGES = 100;

interface Paginated<T> {
    data: T[];
    pagination: { total_items: number; next_page: number | null };
}

interface DepartmentDoc {
    _id: string;
    /** The upstream field is `title`; there is no `name`. */
    title: string;
}

interface VendorDoc {
    _id: string;
    no: string;
    name: string;
}

interface MaterialDoc {
    _id: string;
    no: string;
    description: string;
    uom: string;
    is_needs_canvass: boolean;
    /**
     * Declared required by `MaterialBase`, but `MaterialSyncJob` never writes it,
     * so no stored document actually has one.
     * TODO(backend): populate `last_cost` from Business Central so estimated
     * costs and purchase request amounts stop reading as zero.
     */
    last_cost?: number;
}

export interface MaterialEntry {
    id: string;
    name: string;
    unit: string;
    unitCost: number;
    needsCanvass: boolean;
}

interface Directory {
    departmentsById: Map<string, string>;
    departmentsByName: Map<string, string>;
    departmentNames: string[];
    vendorsById: Map<string, string>;
    vendorsByName: Map<string, string>;
    vendorNames: string[];
    materialsById: Map<string, MaterialEntry>;
    materialsByName: Map<string, MaterialEntry>;
    catalog: CatalogItem[];
}

/**
 * Cached across requests in module scope, and the in-flight promise is cached
 * too — otherwise a cold start with several concurrent requests would fire the
 * whole page-through once per request.
 */
let cached: { at: number; directory: Directory } | null = null;
let inFlight: Promise<Directory> | null = null;

/** Pages a list endpoint until it runs out, honouring the upstream page cap. */
async function fetchAll<T>(client: FastApiClient, path: string): Promise<T[]> {
    const results: T[] = [];

    for (let page = 1; page <= MAX_PAGES; page += 1) {
        const response = await client.get<Paginated<T>>(path, {
            page,
            page_size: MAX_PAGE_SIZE,
        });

        results.push(...response.data);

        if (response.pagination.next_page === null) break;
    }

    return results;
}

function toMaterialEntry(doc: MaterialDoc): MaterialEntry {
    return {
        id: doc._id,
        name: doc.description,
        unit: doc.uom,
        unitCost: doc.last_cost ?? 0,
        needsCanvass: doc.is_needs_canvass,
    };
}

async function build(client: FastApiClient): Promise<Directory> {
    const [departments, vendors, materials] = await Promise.all([
        fetchAll<DepartmentDoc>(client, "/departments"),
        fetchAll<VendorDoc>(client, "/vendors"),
        fetchAll<MaterialDoc>(client, "/materials"),
    ]);

    const departmentsById = new Map<string, string>();
    const departmentsByName = new Map<string, string>();
    for (const doc of departments) {
        if (!doc.title) continue;
        departmentsById.set(doc._id, doc.title);
        departmentsByName.set(doc.title, doc._id);
    }

    const vendorsById = new Map<string, string>();
    const vendorsByName = new Map<string, string>();
    for (const doc of vendors) {
        // The Business Central sync produces vendors with an empty name (V20049,
        // for one). They would render as a blank, unselectable picker option.
        const name = doc.name?.trim();
        if (!name) continue;
        vendorsById.set(doc._id, name);
        if (!vendorsByName.has(name)) vendorsByName.set(name, doc._id);
    }

    const materialsById = new Map<string, MaterialEntry>();
    const materialsByName = new Map<string, MaterialEntry>();
    for (const doc of materials) {
        const entry = toMaterialEntry(doc);
        if (!entry.name) continue;
        materialsById.set(entry.id, entry);
        // Descriptions are not unique upstream; first one wins, matching the order
        // the picker shows them in.
        if (!materialsByName.has(entry.name))
            materialsByName.set(entry.name, entry);
    }

    const catalog = [...materialsByName.values()].map((entry) => ({
        name: entry.name,
        unit: entry.unit,
        unitCost: entry.unitCost,
    }));

    return {
        departmentsById,
        departmentsByName,
        departmentNames: [...departmentsByName.keys()].sort(),
        vendorsById,
        vendorsByName,
        vendorNames: [...vendorsByName.keys()].sort(),
        materialsById,
        materialsByName,
        catalog,
    };
}

export function getDirectory(client: FastApiClient): Promise<Directory> {
    if (cached && Date.now() - cached.at < TTL_MS) {
        return Promise.resolve(cached.directory);
    }

    inFlight ??= build(client)
        .then((directory) => {
            cached = { at: Date.now(), directory };
            return directory;
        })
        .finally(() => {
            inFlight = null;
        });

    return inFlight;
}

/** Drops the snapshot so the next read pages everything in again. */
export function invalidateDirectory(): void {
    cached = null;
}

export async function listDepartmentNames(
    client: FastApiClient,
): Promise<string[]> {
    return (await getDirectory(client)).departmentNames;
}

export async function listVendorNames(
    client: FastApiClient,
): Promise<string[]> {
    return (await getDirectory(client)).vendorNames;
}

/**
 * A page of the catalog, sliced from the snapshot.
 *
 * The picker pages so the browser is not handed ~1,900 options at once; the
 * data is already in memory, so a scroll costs nothing upstream.
 */
export async function catalogPage(
    client: FastApiClient,
    page: number,
    pageSize: number,
): Promise<CatalogItemPage> {
    const { catalog } = await getDirectory(client);
    const start = (page - 1) * pageSize;

    return {
        items: catalog.slice(start, start + pageSize),
        total: catalog.length,
        page,
        pageSize,
    };
}

/**
 * A page of catalog search results, straight from upstream.
 *
 * This deliberately bypasses the snapshot. The snapshot indexes materials by
 * `description` only, whereas `/materials?search=` also matches `title` and
 * `no` — the item code people actually type — so filtering in memory here would
 * silently answer a narrower question. The cost is one upstream request per
 * search; callers are expected to debounce.
 */
export async function catalogSearchPage(
    client: FastApiClient,
    page: number,
    pageSize: number,
    search: string,
): Promise<CatalogItemPage> {
    const response = await client.get<Paginated<MaterialDoc>>("/materials", {
        page,
        page_size: Math.min(pageSize, MAX_PAGE_SIZE),
        search,
    });

    // Descriptions are not unique upstream, and unlike the snapshot a raw search
    // response has not been collapsed by name — so do it here too, first one
    // wins, or the picker would offer the same option twice.
    const byName = new Map<string, CatalogItem>();
    for (const doc of response.data) {
        const entry = toMaterialEntry(doc);
        if (!entry.name || byName.has(entry.name)) continue;
        byName.set(entry.name, {
            name: entry.name,
            unit: entry.unit,
            unitCost: entry.unitCost,
        });
    }

    return {
        items: [...byName.values()],
        total: response.pagination.total_items,
        page,
        pageSize,
    };
}

/** Display name for a stored id, falling back to the id when it is unknown. */
export async function departmentName(
    client: FastApiClient,
    id: string | null | undefined,
): Promise<string> {
    if (!id) return "";
    return (await getDirectory(client)).departmentsById.get(id) ?? id;
}

export async function vendorName(
    client: FastApiClient,
    id: string | null | undefined,
): Promise<string | null> {
    if (!id) return null;
    return (await getDirectory(client)).vendorsById.get(id) ?? id;
}

export async function materialById(
    client: FastApiClient,
    id: string | null | undefined,
): Promise<MaterialEntry | null> {
    if (!id) return null;
    return (await getDirectory(client)).materialsById.get(id) ?? null;
}

export async function materialByName(
    client: FastApiClient,
    name: string,
): Promise<MaterialEntry | null> {
    return (await getDirectory(client)).materialsByName.get(name) ?? null;
}

export async function resolveDepartmentId(
    client: FastApiClient,
    name: string,
): Promise<string | null> {
    return (await getDirectory(client)).departmentsByName.get(name) ?? null;
}

export async function resolveVendorId(
    client: FastApiClient,
    name: string | null | undefined,
): Promise<string | null> {
    if (!name) return null;
    return (await getDirectory(client)).vendorsByName.get(name) ?? null;
}
