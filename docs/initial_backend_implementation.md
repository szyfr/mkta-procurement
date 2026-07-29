# Purchase Requests BFF Integration — Agent Instructions

## Context

- Frontend: `purchasing-ui/` — Next.js (App Router), TypeScript, Biome
- Backend: `C:/projects/purchasing-app/purchasing-backend/` — FastAPI
- Scope: **Purchase Requests module only.** Do not modify or implement other modules unless strictly required for shared infrastructure (and call that out explicitly if it happens).

## Non-negotiable constraints

- The browser must **never** call FastAPI directly. All traffic goes through Next.js Route Handlers (the BFF).
- Use a feature-based **Module + DAL + DTO** architecture.
- Do **not** implement: authentication, authorization, search, filtering, sorting, file uploads.
- Only integrate endpoints that **currently exist** in the FastAPI backend. If something the UI needs isn't implemented on the backend yet, don't fake it — document it as a gap instead (see "If an endpoint is unavailable" below).
- Preserve the existing UI, layout, routing, components, design, and UX. This is an integration, not a redesign.
- Reuse existing project structure, utilities, helpers, and shared types. Do not duplicate anything that already exists.

## Architecture

```
Browser
  ↓
React Components
  ↓
Frontend API Client   (client-side; calls the BFF only)
  ↓
Next.js Route Handlers (BFF)
  ↓
Purchase Requests Module → DAL   (server-side; calls FastAPI only)
  ↓
FastAPI
```

**Important distinction — there are two separate "client" layers, don't conflate them:**

| Layer | Runs where | Talks to | Never talks to |
|---|---|---|---|
| Frontend API Client (`modules/purchase-requests/api/`) | Browser | Next.js BFF routes only | FastAPI |
| DAL (`modules/purchase-requests/dal/`) | Server (inside Route Handlers) | FastAPI only | — |

## Target file structure

```
src/
├── app/
│   └── api/
│       └── purchase-requests/
│           ├── route.ts
│           ├── [id]/
│           │   └── route.ts
│           └── item-requests/
│               └── route.ts
│
├── modules/
│   └── purchase-requests/
│       ├── api/
│       │   ├── client.ts
│       │   └── endpoints.ts
│       ├── dal/
│       │   └── purchase-request.dal.ts
│       ├── dto/
│       │   ├── purchase-request.dto.ts
│       │   ├── create-purchase-request.dto.ts
│       │   ├── update-purchase-request.dto.ts
│       │   └── index.ts
│       ├── mappers/
│       │   └── purchase-request.mapper.ts
│       ├── models/
│       │   └── purchase-request.ts
│       ├── constants/
│       ├── utils/
│       ├── types/
│       └── index.ts
│
├── lib/
│   └── api/
│       ├── fetcher.ts
│       ├── config.ts
│       └── errors.ts
```

Reuse the existing project structure wherever it already covers one of these concerns — don't recreate `lib/api/*` if an equivalent already exists, for example.

## Layer responsibilities

**React Components**
- Render UI only. No direct HTTP calls, no business logic, no knowledge of FastAPI.

**Frontend API Client**
- Reusable, strongly-typed functions for the Purchase Requests module.
- Calls the Next.js BFF only — never FastAPI.
- Handles request serialization and response parsing; centralizes request config.

**Next.js Route Handlers (BFF)**
- Proxy requests to FastAPI; hide backend URLs from the browser entirely.
- Normalize request/response shapes and centralize API error handling.
- Return consistent, predictable HTTP responses to the frontend.

**Purchase Requests Module**
- Self-contained owner of all Purchase Requests business logic: DAL, DTOs, models, mappers, constants, module-specific utilities.

**DAL**
- Executes HTTP requests to FastAPI, serializes payloads, deserializes responses, throws standardized errors. No UI logic.

**DTOs**
- Mirror the FastAPI request/response contracts closely. Separate DTOs for Create, Update, and Response shapes. Never exposed directly to React components.

**Models**
- Frontend domain objects, used throughout the UI instead of raw DTOs wherever practical.

**Mappers**
- Convert DTOs → models when the backend shape differs from what the UI needs. All transformation logic lives here — never in components.

---

## Phase 1 — Analysis (no code changes yet)

Before writing any code, analyze:

- `purchasing-ui/`: existing frontend architecture, folder structure, existing Purchase Requests implementation (including any mock data).
- `purchasing-backend/`: Purchase Request endpoints, request/response models, validation rules, error responses, OpenAPI schema if available.

Then produce a comparison covering:

- Existing vs. missing endpoints
- Request/response mismatches and naming inconsistencies
- Required field mappings
- Backend limitations or functionality that can't yet be implemented
- A data-mapping strategy (DTO → model)
- A concrete implementation plan for Phases 2–4

**Stop here.** Present the analysis and implementation plan and wait for explicit approval before touching any code.

## Phase 2 — BFF Route Handlers

Create/update:
```
app/api/purchase-requests/route.ts
app/api/purchase-requests/[id]/route.ts
app/api/purchase-requests/item-requests/route.ts
```
Each should forward requests to FastAPI, normalize responses where the shape genuinely needs it, handle errors consistently, return predictable response shapes, and keep backend URLs out of anything the browser can see.

## Phase 3 — Purchase Requests Module

Create/update the API client, DAL, DTOs, models, mappers, and module exports (`modules/purchase-requests/index.ts`). Keep responsibilities separated per the table above — no business logic leaking into Route Handlers or components.

## Phase 4 — UI Integration

Integrate only:
- Purchase Requests List
- Purchase Request Detail
- Create Purchase Request
- Item Requests (if the backend currently supports it)

Replace all mock/temporary data with real API calls. Reuse existing components; don't redesign. If an endpoint the UI currently expects isn't available on the backend, keep the page functional — show the existing empty state/placeholder, don't introduce fake data, and document the gap.

---

## Error handling

- Consistent API error handling across the module.
- Normalize backend error responses where appropriate.
- Show user-friendly messages; never leak backend implementation details to the client.

## Definition of done

Run and resolve all issues from:
```
npm run lint
npm run build
```
Specifically check for: TypeScript errors, Biome issues, runtime errors, hydration errors, build errors. Manually verify List, Detail, Create, Item Requests (if applicable), empty states, and error handling all work. Confirm all Purchase Requests mock data has been removed.

## Post-implementation deliverables

- Files created / modified
- BFF routes implemented
- API client modules implemented
- DAL implemented
- DTOs created
- Models created
- Mappers created
- Pages integrated
- Mock data removed
- Backend issues/inconsistencies discovered during implementation
- Assumptions made
- Remaining TODOs
- Recommendations for future modules to follow this same Module + DAL + DTO pattern