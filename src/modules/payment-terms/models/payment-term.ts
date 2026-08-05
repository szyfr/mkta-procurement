/**
 * The `/payment-terms` response, verbatim — snake_case, `_id` keys, exactly
 * what FastAPI sends. List responses arrive inside the shared pagination
 * envelope, see `lib/api/pagination`.
 *
 * A payment term is only `title` and `description` upstream. There is no
 * `days` field and no numeric net period to render or sort on.
 */
export interface PaymentTerm {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}
