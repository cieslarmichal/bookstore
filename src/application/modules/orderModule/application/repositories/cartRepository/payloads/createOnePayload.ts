import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { CartStatus } from '../../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../../domain/entities/cart/deliveryMethod';

export const createOnePayloadSchema = Schema.object({
  id: Schema.string(),
  customerId: Schema.string(),
  status: Schema.enum(CartStatus),
  totalPrice: Schema.number(),
  billingAddressId: Schema.string().optional(),
  shippingAddressId: Schema.string().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
