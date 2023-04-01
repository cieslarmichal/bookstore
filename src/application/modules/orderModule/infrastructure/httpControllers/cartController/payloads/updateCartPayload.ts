import { AccessTokenData } from '../../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { DeliveryMethod } from '../../../../domain/entities/cart/deliveryMethod';

export const updateCartPayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type UpdateCartPayload = SchemaType<typeof updateCartPayloadSchema>;
