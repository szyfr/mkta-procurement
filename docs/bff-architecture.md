# BFF Architecture

The React app never talks to a database or to a remote service. It talks to
Next.js Route Handlers, which talk to a repository interface, which has one
implementation today (SQLite) and one waiting (FastAPI).

SQLite is temporary. Replacing it means filling in method bodies in
`src/lib/repositories/fastapi/` and setting one environment variable. No
component, hook, API client module or route handler changes.

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
      sqlite/                     Drizzle implementation
      fastapi/                    HTTP implementation (transport done, methods stubbed)
      repository-factory.ts       the single switch point
    auth/session.ts               cookie → principal
    http/                         ok/created/ApiError/withRoute/defineRoute
    validation/schemas.ts         zod schemas
    format/dates.ts               stored value → display string
    reports/presentation.ts       report icons + chart config (client-only)
    status-tones.ts               status → pill tone (shared by client and mappers)

  db/
    schema/                       24 tables
    migrations/                   drizzle-kit output
    mappers/                      row → DTO
    index.ts                      connection singleton, migrate, ensureDatabaseReady
    seed.ts                       fixtures → real records

  data/                           seed fixtures ONLY (+ navigation.ts, which is app config)
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
                      ├─ SQLite (Drizzle)        ← active
                      └─ FastAPI (HTTP + cookies) ← future
```

**The contract is the interface set in `src/lib/types.ts`.** The REST API returns
exactly those shapes. That is why the presentational components did not change
when the data moved behind an API, and it is what a future FastAPI must satisfy.

Every response uses one envelope:

```jsonc
{ "data": … , "meta": { "total": 6 } }                     // success
{ "error": { "code": "NOT_FOUND", "message": "…" } }        // failure
```

`withRoute` maps `ZodError → 422`, `ApiError → its status`, anything else → a
bare `500` with the detail logged server-side, never returned.

## 3. API endpoints

```
GET    /api/health                                        readiness + row counts
GET    /api/session                                       who am I
POST   /api/auth/login                                    sets HttpOnly cookie
POST   /api/auth/logout

GET    /api/dashboard                                     kpis, actionable, activity, quotations, deadlines

GET    /api/purchase-requests                             ?status&priority&department&q&page&pageSize&listedOnly
POST   /api/purchase-requests
GET    /api/purchase-requests/[id]
PATCH  /api/purchase-requests/[id]
DELETE /api/purchase-requests/[id]
POST   /api/purchase-requests/[id]/submit
POST   /api/purchase-requests/[id]/items/[itemId]/proof-of-order

GET    /api/item-creation-requests
POST   /api/item-creation-requests

GET    /api/canvassing                                    ?department&status
GET    /api/canvassing/[id]
POST   /api/canvassing/[id]/batches                       { itemIds } → { batch }
POST   /api/canvassing/[id]/batches/[batch]/quotes
POST   /api/canvassing/[id]/batches/[batch]/select-vendor  { quoteId }

GET    /api/reports
GET    /api/reports/[id]                                  ?dateRange&department&vendor

GET    /api/notifications
PATCH  /api/notifications/[id]/read
POST   /api/notifications/read-all

GET    /api/search                                        ?q
GET    /api/vendors  /api/departments  /api/catalog-items  /api/payment-terms

GET    /api/settings/account      PATCH /api/settings/account
GET    /api/settings/users        GET   /api/settings/roles
```

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

They are bundled as `Repositories` and resolved by
`getRepositories(ctx: RequestContext)` — the **only** place the backend is chosen:

```ts
process.env.PROCUREMENT_BACKEND === "fastapi" ? fastApi : sqlite   // default: sqlite
```

`RequestContext` carries the incoming `Cookie` header and a `relaySetCookie`
callback. SQLite ignores both; FastAPI uses them.

## 5. SQLite implementation

Drizzle ORM over `better-sqlite3`, pinned to `^12.11.1` — v13 dropped
`prebuild-install` and compiles from source, which needs a C++ toolchain.

- Multi-table writes run in `db.transaction()`. Submitting a request writes item
  statuses, purchase orders, order lines and an activity entry atomically;
  awarding a batch writes the batch, the PO, its lines, the item vendors and the
  rolled-up request status atomically.
- Aggregates load in a fixed number of queries — `loadAggregates` fetches items,
  documents, comments and activity for N requests in four queries, not 4N.
- **Mappers** (`src/db/mappers/`) turn stored values into the display strings the
  DTO promises: `2026-07-20 → "Jul 20"`, an instant → `"10 minutes ago"`,
  a batch's state → `"Comparison Ready"` plus its tone.
- Dates are stored as `YYYY-MM-DD` text and formatted by string manipulation.
  `new Date("2026-07-20")` parses as UTC midnight, so any timezone west of UTC
  renders it a day early.

## 6. FastAPI placeholder

`src/lib/repositories/fastapi/` contains real classes implementing every
interface. Each method throws `NOT_IMPLEMENTED` (surfaced as HTTP 501). The
**transport is complete**: `FastApiClient` handles base URL, cookie forwarding,
`Set-Cookie` relaying and error translation, because that is where the migration
risk actually is.

Implementing an endpoint is one line:

```ts
getById(id: string) {
  return this.client.request<PurchaseRequest>(`/purchase-requests/${id}`);
}
```

Because the stubs compile against the same interfaces, the type checker already
proves the remote backend can satisfy the contract.

## 7. Database schema

24 tables. Migrations in `src/db/migrations`, generated by `drizzle-kit generate`
and applied at boot.

| Group | Tables |
|---|---|
| Master data | `users`, `departments`, `vendors`, `catalog_items`, `payment_terms`, `role_permissions` |
| Purchase requests | `purchase_requests`, `purchase_request_items`, `pr_documents`, `pr_comments`, `pr_activity`, `item_creation_requests` |
| Canvassing | `canvassing_batches`, `canvassing_batch_items`, `vendor_quotes`, `vendor_quote_lines` |
| Orders | `purchase_orders`, `purchase_order_items` |
| Presentation-backed | `reports`, `notifications`, `dashboard_kpis`, `activity_feed`, `pending_quotations`, `deadlines` |

Decisions the seed data forced:

- **`purchase_requests.amount` is stored, not summed.** Only 4 of the 10 seeded
  requests equal their item total (PR-2026-0114 stores 84,200 against 14,000
  computed). Recomputing would silently change the specified figures.
- **`action_step` / `action_step_tone` / `action_order`** are columns. The
  dashboard's step text and tone are not a function of status — they diverge
  from `statusLabel` on 3 of 6 rows and from the tone map on 4 of 6.
- **`list_order`** preserves the hand-curated wireframe ordering; it is not a
  sort key that can be recomputed.
- **`quotes_received_baseline`** holds quotes counted before their individual
  rows existed, so `quotesReceived = baseline + rows` and a newly submitted
  quote still moves the number.
- **`selected_quote_id`** is named for what it holds; the DTO field is
  `selectedVendorId` but the value is a *quote* id.
- **`notifications.created_at`** is a real instant. `timestamp` and `group` are
  derived on read, which is what stops them being frozen at seed time.

## 8. Authentication flow

Structure is in place; enforcement is deliberately off. An unauthenticated
request resolves to the seeded procurement officer rather than being rejected,
so the app can be exercised end to end without a login step.

```
today:   Browser ──cookie──▶ BFF ──▶ getCurrentUser() ──▶ Actor ──▶ repository
future:  Browser ──cookie──▶ BFF ──forwards Cookie──▶ FastAPI
                                 ◀──relays Set-Cookie──
```

- The cookie is `HttpOnly`, `sameSite=lax`, `secure` in production.
- No JWT ever reaches React. Nothing is stored in `localStorage` or
  `sessionStorage`. The client asks `/api/session` who it is.
- Route handlers already thread an `Actor` into every write, so authorship is
  recorded correctly from day one.

To turn enforcement on: have `getCurrentUser` throw `UNAUTHORIZED` instead of
falling back, and add the guard to `proxy.ts` (Next.js 16 renamed
`middleware.ts` → `proxy.ts`). No call site changes.

## 9. Request flow

Reading a purchase request:

```
PurchaseRequestDetailView
  └─ usePurchaseRequest(id)                    hooks/purchase-requests/
      └─ purchaseRequestsApi.get(id)           lib/api/
          └─ GET /api/purchase-requests/[id]   app/api/…/route.ts
              └─ defineRoute: await params → getCurrentUser() → getRepositories()
                  └─ SqlitePurchaseRequestRepository.getById()
                      └─ Drizzle: request + items + documents + comments + activity
                          └─ toPurchaseRequest() → "Jul 20", "PO-3025 Created"
              ◀── { data: PurchaseRequest }
      ◀── cached under ["purchase-requests","detail",id]
```

Writing (awarding a vendor) additionally invalidates the canvassing detail, the
canvassing list, the request, the request list and the dashboard — grouped in
one helper so no mutation can forget one.

## 10. Migration strategy

The frontend does not change. In order:

1. Stand up FastAPI exposing the DTO shapes in `src/types/`. The contract is
   already written down; `/api/health` and the route handlers are the reference.
2. Implement one repository method at a time in
   `src/lib/repositories/fastapi/`, replacing a `notImplemented()` with a
   `this.client.request(...)`. Ship incrementally — a partially migrated backend
   returns 501 for the rest, which the UI surfaces as an error state rather than
   a crash.
3. Move date formatting and status-label derivation upstream, or keep the
   mappers in the BFF. Either works; the DTO is what matters.
4. Set `FASTAPI_BASE_URL` and `PROCUREMENT_BACKEND=fastapi`.
5. Hand cookie issuance to FastAPI: `/api/auth/login` forwards credentials and
   relays the upstream `Set-Cookie`. `FastApiClient` already does this.
6. Delete `src/db/`, `src/data/` and the `better-sqlite3` and `drizzle-*`
   dependencies.

**Verifying the boundary:** run with `PROCUREMENT_BACKEND=fastapi`. Every data
endpoint must return 501. Anything that still returns data is bypassing the
repository layer.

---

## Running it

```bash
npm run dev           # migrates and seeds on first request
npm run db:generate   # regenerate migrations after a schema change
npm run db:reset      # delete the database; it is recreated and reseeded on next boot
```

Seeded activity and notification timestamps are real instants anchored to seed
time, so they age — "10 minutes ago" becomes "Yesterday" the next day. That is
correct behaviour for real data; `npm run db:reset` gives a fresh demo.
