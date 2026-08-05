/**
 * The `/departments` response, verbatim — snake_case, `_id` keys, exactly what
 * FastAPI sends. Nothing reshapes it on the way to a component, so a field
 * that appears here is a field the backend has.
 *
 * List responses arrive inside the shared pagination envelope, see
 * `lib/api/pagination`.
 */
export interface Department {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}
