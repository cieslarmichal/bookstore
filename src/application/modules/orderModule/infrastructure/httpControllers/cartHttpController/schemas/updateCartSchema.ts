import { cartSchema } from './cartSchema';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { DeliveryMethod } from '../../../../domain/entities/cart/deliveryMethod';

export const updateCartPathParametersSchema = Schema.object({
  id: Schema.string(),
});

export type UpdateCartPathParameters = SchemaType<typeof updateCartPathParametersSchema>;

export const updateCartBodySchema = Schema.object({
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
});

export type UpdateCartBody = SchemaType<typeof updateCartBodySchema>;

export const updateCartResponseOkBodySchema = Schema.object({
  cart: cartSchema,
});

export type UpdateCartResponseOkBody = SchemaType<typeof updateCartResponseOkBodySchema>;
