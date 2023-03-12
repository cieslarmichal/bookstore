import { AccessTokenData } from '../../../../../common/types/accessTokenData';
import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { PaymentMethod } from '../../../domain/entities/order/paymentMethod';

export const createOrderPayloadSchema = Schema.object({
  cartId: Schema.notEmptyString(),
  paymentMethod: Schema.enum(PaymentMethod),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateOrderPayload = SchemaType<typeof createOrderPayloadSchema>;
