# BFF Architecture

The React app never talks to a database or to a remote service. It talks to
Next.js Route Handlers, which talk to a repository interface, which now has two
implementations: FastAPI over HTTP, and a set of empty stand-ins.

The split is not a configuration choice. It is a statement of what the backend
implements. FastAPI serves purchase requests, departments, materials and
vendors; it has no endpoints for the dashboard, canvassing, reports,
notifications, search or settings. Those **read** as empty — an empty list, a
dashboard of empty panels — so the UI shows the empty state it already has for
each of them, and nothing invents data that does not exist. Their **writes**
still return 501, because each has to hand back the record it claims to have
stored. As endpoints land, entries move from one bundle to the other in
`repository-factory.ts` and nothing above that line changes.

---

## 1. Folder structure

```
src/
  app/
    (auth)/login/                 decorative login page
    (dashboard)/                  page.tsx files: metadata + a client view
    api/                          the BFF — see §3
    providers.tsx                 QueryClientProvider
    not-found.tsx, (dashboard)/error.tsx

  components/
    <feature>/*-view.tsx          client views that own the queries
    <feature>/*.tsx               presentational components (props only)
    shared/query-state.tsx        DataError, TableSkeleton, CardsSkeleton, PanelSkeleton
    ui/                           shadcn primitives (untouched)

  hooks/
    query-keys.ts                 every cache key, in one place
    purchase-requests/            one file per operation
    canvassing/  dashboard/  reports/  notifications/
    search/  settings/  reference/  session/
    use-debounced-value.ts

  lib/
    api/                          browser → BFF client (client.ts + per-feature modules)
    repositories/
      interfaces/                 the contract
      fastapi/                    HTTP implementation — client, directory cache, mappers
      unimplemented.ts            empty stand-ins for the unbuilt endpoints
      repository-factory.ts       the single composition point
    auth/session.ts               cookie → principal
    http/                         ok/created/ApiError/withRoute/defineRoute
    validation/schemas.ts         zod schemas
    format/dates.ts               stored value → display string
    reports/presentation.ts       report icons + chart config (client-only)
    status-tones.ts               status → pill tone (shared by client and mappers)

  data/navigation.ts              app config (the sidebar)
  types/                          the DTO contract
```

## 2. Architecture overview

```
Browser
  └─ React components ............ render only; never call fetch()
      └─ TanStack Query hooks .... caching, dedup, invalidation, optimistic updates
          └─ API client .......... typed fetch, unwraps the envelope, throws ApiClientError
              └─ Route Handlers .. validate → resolve actor → call one repository method
                  └─ Repository interface
                      ├─ FastAPI (HTTP + cookies)  purchase requests, reference data
                      └─ Empty stand-ins           everything not built yet
```

**The contract is the interface set in `src/lib/types.ts`.** The REST API returns
exactly those shapes. That is why the presentational components did not change
when the data moved behind an API, and why swapping SQLite for FastAPI beneath
them changed no component at all.

Every response uses one envelope:

```jsonc
{ "data": … , "meta": { "total": 6 } }                     // success
{ "error": { "code": "NOT_FOUND", "message": "…" } }        // failure
```

`withRoute` maps `ZodError → 422`, `ApiError → its status`, anything else → a
bare `500` with the detail logged server-side, never returned.

## 3. API endpoints

```
GET    /api/health                                        upstream reachability + unbuilt module list
GET    /api/session                                       who am I
POST   /api/auth/login                                    sets HttpOnly cookie
POST   /api/auth/logout

GET    /api/dashboard                                     empty — kpis, actionable, activity, quotations, deadlines

GET    /api/purchase-requests                             ?q&page&pageSize  (status/priority/department accepted, not yet applied)
POST   /api/purchase-requests
GET    /api/purchase-requests/[id]
PATCH  /api/purchase-requests/[id]
DELETE /api/purchase-requests/[id]
POST   /api/purchase-requests/[id]/submit                 501
POST   /api/purchase-requests/[id]/items/[itemId]/proof-of-order   501

GET    /api/item-creation-requests                        empty
POST   /api/item-creation-requests                        501

GET    /api/canvassing                                    empty  ?department&status
GET    /api/canvassing/[id]                               404 (no case exists)
POST   /api/canvassing/[id]/batches                       501
POST   /api/canvassing/[id]/batches/[batch]/quotes        501
POST   /api/canvassing/[id]/batches/[batch]/select-vendor  501

GET    /api/reports                                       empty
GET    /api/reports/[id]                                  404  ?dateRange&department&vendor

GET    /api/notifications                                 empty
PATCH  /api/notifications/[id]/read                       501
POST   /api/notifications/read-all                        empty

GET    /api/search                                        empty  ?q
GET    /api/vendors  /api/departments
GET    /api/payment-terms                                 empty
GET    /api/catalog-items                                 ?page&pageSize (paged; the rest are whole lists)

GET    /api/settings/account      PATCH /api/settings/account  501
GET    /api/settings/users        empty
GET    /api/settings/roles        empty
```

Routes marked `empty` have no upstream endpoint and answer with an empty
payload, which the UI renders as its own empty state — the `404`s are the same
thing for a single record, and the detail views already render those as an
empty panel rather than an error. Routes marked `501` are the writes behind
those same unbuilt modules: each has to return the record it stored, so a
success would be a lie about a save that never happened. Nothing in the UI can
reach one, because nothing is listed to act on.

The contract itself is unchanged — every path, verb and payload shape is the
same as it was over SQLite, apart from `/api/catalog-items` gaining paging and
`POST /api/purchase-requests` gaining a required `dateNeeded`.

## 4. Repository interfaces

`src/lib/repositories/interfaces/`. One interface per aggregate:
`PurchaseRequestRepository`, `CanvassingRepository`, `ItemCreationRequestRepository`,
`DashboardRepository`, `ReportRepository`, `NotificationRepository`,
`SearchRepository`, `UserRepository`, `ReferenceRepository`.

```ts
export interface PurchaseRequestRepository {
  list(filters: PurchaseRequestFilters): Promise<Paginated<PurchaseRequest>>;
  getById(id: string): Promise<PurchaseRequest | null>;
  create(input: CreatePurchaseRequestInput, actor: Actor): Promise<PurchaseRequest>;
  update(id: string, input: UpdatePurchaseRequestInput, actor: Actor): Promise<PurchaseRequest>;
  delete(id: string): Promise<void>;
  submit(id: string, actor: Actor): Promise<PurchaseRequest>;
  recordProofOfOrder(id: string, itemId: string, input: ProofOfOrderInput, actor: Actor): Promise<PurchaseRequest>;
}
```

They are bundled as `Repositories` and composed by
`getRepositories(ctx: RequestContext)` — the **only** place a data source is
chosen:

```ts
{ ...createUnimplementedRepositories(), ...createFastApiRepositories(ctx) }
```

The order is the point: FastAPI wins wherever it implements something, and a
module graduates by being added to the second bundle.

`RequestContext` carries the incoming `Cookie` header and a `relaySetCookie`
callback. The stand-ins ignore both; FastAPI forwards them.

## 5. FastAPI implementation

`src/lib/repositories/fastapi/`. Four files:

- **`client.ts`** — base URL, cookie forwarding, `Set-Cookie` relaying, error
  translation. The upstream is not consistent about error shape: `HTTPException`
  produces `{"detail": …}`, the controllers hand-roll `{"message": …}` for the
  400s and 404s they return directly, and Pydantic's 422 makes `detail` a list.
  All three are read, or every "… not found" message would be dropped.
- **`directory.ts`** — the reference cache. The DTO speaks in names, Mongo in
  ObjectIds, so this pages `/departments`, `/vendors` and `/materials` in once
  (~24 calls at the upstream cap of 100/page), indexes them both ways, and holds
  the result for 5 minutes. The in-flight promise is cached too, so a cold start
  under concurrency warms up once rather than once per request. The catalog
  picker's pages are sliced from the same snapshot, so scrolling costs nothing
  upstream.
- **`mappers.ts`** — documents → DTOs, and the honest record of what is missing.
- **`purchase-request-repository.ts`** — the aggregate, plus the two workarounds
  described in §6.

## 6. What the backend does not store

The upstream purchase request holds a title, priority, justification, a needed
date, a department id, a requester id and its items. The DTO needs rather more.
These are derived in the mapper, each with a `TODO(backend)`:

| DTO field | Today | Blocked on |
|---|---|---|
| `status`, `statusLabel` | always `draft` / `"Draft"` | no `status` field exists — the whole draft → canvassing → PO → completed workflow is unrepresented |
| `amount`, `estimatedUnitCost` | always `0` | `MaterialSyncJob` never writes `last_cost`, though `MaterialBase` declares it required |
| `requester` | resolved against the fixture users | `requester_id` is an opaque Cognito id and there is no user collection |
| `sourcing` | from the item's `is_needs_canvass` | the only sourcing signal stored |
| `submittedOn`, `documents`, `comments`, `activity` | omitted | not stored |
| item `status`, `batch`, `deliveredOn` | `pending`, omitted | items carry no lifecycle state |

`submit` and `recordProofOfOrder` throw `NOT_IMPLEMENTED` (501), which the UI
surfaces as an error state rather than a crash.

Two upstream bugs are worked around rather than waited on:

- **`PUT` cannot take a partial body.** The controller iterates
  `payload["items"]` unconditionally and the field defaults to `None`, so
  editing only a title returns `500 'NoneType' object is not iterable`. `update`
  reads the request's current items back and re-sends them.
- **404s arrive as 400s.** Every controller catches `HTTPException` and returns a
  flat `{"message": "Bad Request"}` *after* the inner code has raised a real 404,
  so deleting a missing request reports 400. `ApiClientError.isNotFound` will not
  fire on those paths.

Also worth knowing: `PUT` deletes and recreates every item, so item ids do not
survive an edit; and the material sync hard-deletes and recreates materials with
fresh `_id`s, orphaning the `material_id` on any pre-existing item — those render
as `Unknown item (<id>)` rather than failing.

## 7. The unbuilt modules

`src/lib/repositories/unimplemented.ts`. The dashboard, reports, notifications,
search, settings, item creation requests, payment terms and canvassing have no
upstream endpoints. Their reads answer with an empty payload — `[]`, a
`DashboardData` whose five panels are all empty, `null` for a single record —
so each page renders the empty state it already ships (`components/ui/empty`)
and no component has to know its module is unbuilt.

Empty is not the same as fabricated. Nothing there invents a row, a total or a
name, which is why the **writes** still throw 501: `create`, `markRead`,
`updateAccount` and the three canvassing writes each have to return the record
they stored, and returning one would report a save that never happened.
Awarding a batch in particular raises a purchase order, sets item vendors and
rolls the request status up — business logic the backend has to own. None of
these is reachable anyway: with nothing listed, there is nothing to act on.

Two reads bend the rule, and both are called out in the file:

- `getAccount` echoes the signed-in principal — the same one `/api/session`
  already serves — rather than a blank profile. The account panel is a form,
  not a list; it has no empty state, and empty strings would read as a wiped
  profile.
- `markAllRead` returns `[]` rather than throwing. There are no notifications
  to mark, so it stores nothing and claims nothing.

## 8. Authentication

Out of scope, and the backend has none — no login, no user collection, and
`requester_id` is reserved for a Cognito user pool id. `getCurrentUser` returns a
single fixture principal and every request is treated as coming from them.

The cookie machinery in `lib/auth/session.ts` is kept deliberately:

```
today:   Browser ──cookie──▶ BFF ──▶ fixture principal ──▶ Actor ──▶ repository
future:  Browser ──cookie──▶ BFF ──forwards Cookie──▶ FastAPI
                                 ◀──relays Set-Cookie──
```

`FastApiClient` already forwards `Cookie` upstream and relays `Set-Cookie` back.
What changes when FastAPI issues sessions is where the principal comes from, not
how it travels. No JWT ever reaches React; the client asks `/api/session`.

## 9. Request flow

Reading a purchase request:

```
PurchaseRequestDetailView
  └─ usePurchaseRequest(id)                    hooks/purchase-requests/
      └─ purchaseRequestsApi.get(id)           lib/api/
          └─ GET /api/purchase-requests/[id]   app/api/…/route.ts
              └─ defineRoute: await params → getCurrentUser() → getRepositories()
                  └─ FastApiPurchaseRequestRepository.getById()
                      └─ GET {FASTAPI_BASE_URL}/purchase-requests/{id}
                          └─ directory lookups resolve department, material, vendor
                          └─ toPurchaseRequest() → "Jul 28", "Draft"
              ◀── { data: PurchaseRequest }
      ◀── cached under ["purchase-requests","detail",id]
```

The catalog picker is the one paged read: `useCatalogItems` is a
`useInfiniteQuery`, and the dropdown's sentinel re-observes after each page so a
short page cannot stall it short of the end.

## 10. What is left

1. Backend: add a `status` field and the workflow transitions behind it.
2. Backend: populate `materials.last_cost` from Business Central.
3. Backend: stop orphaning `material_id` on every material sync.
4. Backend: let `PUT` accept a partial body; stop collapsing 404s into 400s.
5. Backend: endpoints for canvassing, dashboard, reports, notifications, search,
   settings and item creation requests. Each one is a line moved in
   `repository-factory.ts` and a class deleted from `unimplemented.ts`.
6. Backend: list filtering by status, priority and department — `search` is the
   only filter the index supports today.
7. Auth, once the backend has it.

## Running it

FastAPI must be up first — the BFF has no local store to fall back on.

```bash
cd ../purchasing-backend && python -m app.main   # or: uvicorn app.main:app --port 8000
npm run dev
```

`.env.local` points the BFF at it:

```
FASTAPI_BASE_URL=http://localhost:8000
```

`GET /api/health` reports whether the upstream is reachable and lists which
modules are still unbuilt — the quickest way to tell a misconfigured base URL
from an application error, and to tell an empty page apart from a broken one.

```bash
npm run lint      # biome check
npm run format    # biome format --write
npm run build
```

Fixture activity and notification timestamps are frozen strings, not instants —
they no longer age, because there is no seed step to anchor them to.
