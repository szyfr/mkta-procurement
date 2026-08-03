# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # next dev
npm run build    # next build — also the type check; there is no separate tsc script
npm run lint     # biome check
npm run format   # biome format --write
```

There is no test runner in this project. `npm run lint && npm run build` is the definition of done for a change — both must be clean (TypeScript errors, Biome issues, hydration errors, build errors).

Env vars live in `.env.local`: `FASTAPI_BASE_URL` (where the BFF reaches FastAPI) and `PURCHASE_REQUEST_REQUESTER_ID` (auth stand-in). Both are server-only and must never be read from a Client Component.

## What this is

Procurement UI for the purchasing app. The FastAPI backend lives in a sibling repo at `C:/projects/purchasing-app/purchasing-backend/`.

Standing constraints, carried over from the Purchase Requests integration brief:

- The browser never calls FastAPI directly — everything goes through the BFF (below).
- Integrate only endpoints that exist on the backend today. If the UI needs something that isn't implemented yet, don't fake it: keep the page functional with its existing empty state and document the gap.
- Reuse existing structure, utilities and shared types rather than duplicating them.
- Auth, authorization, sorting and file uploads are out of scope.

## Architecture: the BFF boundary

The browser **never** calls FastAPI. Every request goes:

```
Component → module api/client.ts → Next Route Handler (/api/*) → module dal/*.dal.ts → FastAPI
```

Two layers are both called "client" — do not conflate them:

| Layer | Runs | Talks to | Never touches |
|---|---|---|---|
| `modules/*/api/client.ts` | browser | own-origin `/api/*` only | FastAPI, snake_case DTOs |
| `modules/*/dal/*.dal.ts` | server, inside Route Handlers | FastAPI only | React |

Consequences that are easy to get wrong:

- **Module barrels (`modules/*/index.ts`) deliberately omit the DAL.** Route Handlers import DALs by full path (`@/modules/purchase-requests/dal/purchase-request.dal`) so a DAL can never be pulled into a client bundle through the barrel. Keep it that way when adding exports.
- `lib/api/fetcher.ts` (`serverFetch`) is the *only* place the server calls FastAPI; DALs use it and nothing else does.
- `lib/api/bff-client.ts` (`bffRequest`) is the *only* place the browser issues fetches. Route Handlers already return models, so responses pass through untransformed.
- Route Handlers return `{ data }` on success and `{ error: { message } }` on failure. `bffRequest` unwraps `.data`; `toErrorResponse` builds the failure envelope.

## Module layout

Feature modules under `src/modules/<feature>/` follow **Module + DAL + DTO**:

```
api/client.ts        browser calls against the BFF
api/endpoints.ts     every BFF path the feature may call (relative, own origin)
dal/*.dal.ts         server-side FastAPI reads/writes
dto/                 the FastAPI contract, snake_case, verbatim
models/              what the UI renders, camelCase
mappers/             DTO → model; the only place the two shapes meet
validation/          request-body parsing for Route Handlers, throws ApiError(422)
queries/             TanStack Query keys + queryOptions factories
constants/           status labels, tones, page sizes, enum maps
index.ts             public surface (no DAL)
```

`purchase-requests`, `departments` and `vendors` exist. New modules should mirror this.

Transformation logic belongs in `mappers/`. Route Handlers stay thin: parse params → call DAL → wrap in `Response.json({ data })` → `catch` → `toErrorResponse(error)`.

## Errors

`lib/api/errors.ts` is the single normalization path. FastAPI reports failures in four different shapes (`{message}`, `{detail}`, `{detail: [...]}`, `{error}`); `normalizeBackendError` funnels all of them into `ApiError`. `toPublicMessage` then decides what the browser sees — upstream text is only surfaced for `validation_failed`, everything else gets fixed user-safe copy. Never pass an upstream message through by hand.

`assertObjectId` (`lib/api/object-id.ts`) rejects non-24-hex ids as a local 404 rather than a round trip.

## Data fetching in the UI

Pages under `src/app/(dashboard)/` are thin **server** shells: they own `metadata`, `await searchParams`, and hand off to a `"use client"` view that runs the queries. The URL is the source of truth for list state (view, page, search, filters) — filters write to search params via `router.replace`, and any filter change drops `page`.

Query definitions live in the module's `queries/`, not the component, so keys and fetchers stay together. Global defaults are in `components/query-provider.tsx` (30s `staleTime`, one retry, no refetch on focus) — the QueryClient is per-render on the server and a singleton only in the browser.

## Mock data still in play

`src/data/*` is static mock data. Purchase Requests, Departments and Vendors are wired to the real backend; **Dashboard, Canvassing, Reports, Settings/Users, notifications and global search are still mock-driven**. When a backend endpoint doesn't exist yet, keep the page functional with its existing empty state — do not invent data, and document the gap. Several fields on `PurchaseRequest` (`amount`, `estimatedUnitCost`) are permanently `null` because no backend source exists; the comments in `lib/types.ts` record which.

## UI conventions

shadcn on **Base UI** (`@base-ui/react`), style `base-nova`, Tailwind v4 (CSS-first config in `src/app/globals.css`, no tailwind.config). Use the `shadcn` MCP server for component work.

Base UI composition differs from Radix: render a Button as a link with `render={<Link href="…" />} nativeButton={false}` rather than `asChild`. Icons take `data-icon="inline-start"` for spacing.

`src/components/ui/` is generated and **excluded from Biome** — don't hand-edit it or expect it to be linted. Cross-feature building blocks (`data-toolbar`, `page-header`, `status-badge`, `priority-badge`, `table-pagination`, `table-skeleton`, `query-states`) live in `src/components/shared/`; check there before writing a new one.

## Comment style

Existing code carries file-header docblocks explaining *why* a layer exists and inline comments that record backend quirks and deliberate omissions (e.g. "the create response carries no material join", "`last_cost` is absent from every synced material"). Match that: comments explain constraints and decisions, not mechanics.
