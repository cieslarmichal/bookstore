import { cartSchema } from './cartSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';

export const removeLineItemPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type RemoveLineItemPathParameters = SchemaType<typeof removeLineItemPathParametersSchema>;

export const removeLineItemBodySchema = Schema.object({
  lineItemId: Schema.string(),
  quantity: Schema.positiveNumber(),
});

export type RemoveLineItemBody = SchemaType<typeof removeLineItemBodySchema>;

export const removeLineItemResponseOkBodySchema = Schema.object({
  cart: cartSchema,
});

export type RemoveLineItemResponseOkBody = SchemaType<typeof removeLineItemResponseOkBodySchema>;
