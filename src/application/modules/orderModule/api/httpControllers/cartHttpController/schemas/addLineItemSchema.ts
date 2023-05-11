import { cartSchema } from './cartSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const addLineItemPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type AddLineItemPathParameters = SchemaType<typeof addLineItemPathParametersSchema>;

export const addLineItemBodySchema = Schema.object({
  bookId: Schema.string(),
  quantity: Schema.positiveNumber(),
});

export type AddLineItemBody = SchemaType<typeof addLineItemBodySchema>;

export const addLineItemResponseOkBodySchema = Schema.object({
  cart: cartSchema,
});

export type AddLineItemResponseOkBody = SchemaType<typeof addLineItemResponseOkBodySchema>;
