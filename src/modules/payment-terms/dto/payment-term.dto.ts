/**
 * The `GET /payment-terms` contract, mirroring FastAPI exactly — snake_case,
 * `_id` keys. Arrives in the shared pagination envelope (`lib/api/pagination`).
 *
 * A payment term is only `title` and `description` upstream. There is no
 * `days` field and no numeric net period to render or sort on, so the picker
 * shows the title with the description beneath it and nothing else.
 */

export interface PaymentTermDto {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}
