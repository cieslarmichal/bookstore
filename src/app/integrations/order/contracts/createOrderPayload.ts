import { SchemaType } from '../../../common/validator/contracts/schemaType';
import { Schema } from '../../../common/validator/implementations/schema';
import { PaymentMethod } from '../../../domain/order/contracts/paymentMethod';
import { AccessTokenData } from '../../accessTokenData';

export const createOrderPayloadSchema = Schema.object({
  cartId: Schema.notEmptyString(),
  paymentMethod: Schema.enum(PaymentMethod),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateOrderPayload = SchemaType<typeof createOrderPayloadSchema>;
