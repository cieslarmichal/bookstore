import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { CartStatus } from '../../cartStatus';
import { DeliveryMethod } from '../../deliveryMethod';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
  status: Schema.enum(CartStatus),
  totalPrice: Schema.number(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
