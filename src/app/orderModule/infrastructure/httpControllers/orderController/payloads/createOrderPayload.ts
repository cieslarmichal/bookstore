import { AccessTokenData } from '../../../../../../common/types/accessTokenData';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { PaymentMethod } from '../../../../domain/entities/order/paymentMethod';

export const createOrderPayloadSchema = Schema.object({
  cartId: Schema.notEmptyString(),
  paymentMethod: Schema.enum(PaymentMethod),
  accessTokenData: Schema.unsafeType<AccessTokenData>(),
});

export type CreateOrderPayload = SchemaType<typeof createOrderPayloadSchema>;
