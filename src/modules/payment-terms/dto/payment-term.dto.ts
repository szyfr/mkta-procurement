/**
 * The `/payment-terms` contract, mirroring FastAPI exactly — snake_case,
 * `_id` keys. List responses arrive in the shared pagination envelope
 * (`lib/api/pagination`).
 *
 * A payment term is only `title` and `description` upstream. There is no
 * `days` field and no numeric net period to render or sort on.
 */

export interface PaymentTermDto {
  _id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentTermDto {
  title: string;
  description: string;
}

/** `PUT /payment-terms/{id}` accepts a full replacement, same shape as create. */
export type UpdatePaymentTermDto = CreatePaymentTermDto;
