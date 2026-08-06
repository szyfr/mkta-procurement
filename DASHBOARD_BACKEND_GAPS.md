# Dashboard — backend gaps

The Dashboard UI is now wired to every endpoint that exists on the backend today. This is a punch list of what's missing to finish it.

## Already covered, no backend change needed

- `GET /purchase-requests?pr_status=...` (repeatable) — powers the Pending Purchase Requests and Partially Completed PRs KPI tiles (`pagination.total_items`) and the Requests Requiring Action table.
- `GET /canvassing` — powers the Pending Quotations KPI tile (`pagination.total_items`) and the Pending Quotations widget list.

## Missing

- **Requiring Your Action** (KPI tile). No way to scope purchase requests to "requires action from the signed-in user" — this is role/assignment-dependent, not just a status filter. Needs either a new query param on `GET /purchase-requests` (e.g. `assigned_to_me=true`, resolved server-side from the session) or a dedicated endpoint.

- **Overdue Deliveries** (KPI tile). No delivery/PO entity exists in the schema. Quotations carry a `delivery_date`, but nothing tracks whether a delivery actually happened. Needs a delivery/PO model with a status, or at minimum a `GET /quotations?overdue=true` filter comparing `delivery_date` to now.

- **Upcoming Deadlines** (widget). Same gap as above — needs a queryable notion of "upcoming" delivery or quote deadlines, ideally sortable by due date with a small `limit`.

- **Recent Activity** (widget). No activity/audit log endpoint exists anywhere in the backend. Needs an audit trail (who did what, when), with at least a `GET /activity?limit=N` recent-events endpoint.
