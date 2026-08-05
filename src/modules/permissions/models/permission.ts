/**
 * The `/permissions` response, verbatim — snake_case, `_id` keys, exactly what
 * FastAPI sends. List responses arrive inside the shared pagination envelope,
 * see `lib/api/pagination`.
 *
 * There is no module/action breakdown upstream — `title` is the full grant
 * key (e.g. `purchase_request.store`) and nothing more.
 */
export interface Permission {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}
