import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { OrderStatus } from '../../orderStatus';
import { PaymentMethod } from '../../paymentMethod';

export const createOnePayloadSchema = Schema.object({
  id: Schema.notEmptyString(),
  cartId: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
  orderNumber: Schema.notEmptyString(),
  status: Schema.enum(OrderStatus),
  paymentMethod: Schema.enum(PaymentMethod),
});

export type CreateOnePayload = SchemaType<typeof createOnePayloadSchema>;
