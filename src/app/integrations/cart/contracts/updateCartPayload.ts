import { DeliveryMethod } from '../../../domain/cart/contracts/deliveryMethod';
import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const updateCartPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type UpdateCartPayload = SchemaType<typeof updateCartPayloadSchema>;
