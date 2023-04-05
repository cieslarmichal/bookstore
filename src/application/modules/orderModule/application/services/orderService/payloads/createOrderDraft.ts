import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { PaymentMethod } from '../../../../domain/entities/order/paymentMethod';

export const createOrderDraftSchema = Schema.object({
  cartId: Schema.string(),
  orderCreatorId: Schema.string(),
  paymentMethod: Schema.enum(PaymentMethod),
});

export type CreateOrderDraft = SchemaType<typeof createOrderDraftSchema>;
