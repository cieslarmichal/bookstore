import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  quantity: Schema.integer(),
  price: Schema.number(),
  totalPrice: Schema.number(),
  bookId: Schema.notEmptyString(),
  cartId: Schema.notEmptyString(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
