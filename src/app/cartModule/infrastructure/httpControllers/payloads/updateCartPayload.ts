import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../../../../common/types/contracts/accessTokenData';
import { DeliveryMethod } from '../../../domain/entities/cart/deliveryMethod';

export const updateCartPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type UpdateCartPayload = SchemaType<typeof updateCartPayloadSchema>;
