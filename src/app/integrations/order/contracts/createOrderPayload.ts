import { PaymentMethod } from '../../../domain/order/contracts/paymentMethod';
import { SchemaType } from '../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../libs/validator/implementations/schema';
import { AccessTokenData } from '../../accessTokenData';

export const createOrderPayloadSchema = Schema.object({
  cartId: Schema.notEmptyString(),
  paymentMethod: Schema.enum(PaymentMethod),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateOrderPayload = SchemaType<typeof createOrderPayloadSchema>;
