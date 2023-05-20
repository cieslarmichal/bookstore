import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const createLineItemPayloadSchema = Schema.object({
  id: Schema.string(),
  quantity: Schema.integer(),
  price: Schema.number(),
  totalPrice: Schema.number(),
  bookId: Schema.string(),
  cartId: Schema.string(),
});

export type CreateLineItemPayload = SchemaType<typeof createLineItemPayloadSchema>;
