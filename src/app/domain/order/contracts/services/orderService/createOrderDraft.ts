import { SchemaType } from '../../../../../libs/validator/contracts/schemaType';
import { Schema } from '../../../../../libs/validator/implementations/schema';
import { PaymentMethod } from '../../paymentMethod';

export const createOrderDraftSchema = Schema.object({
  cartId: Schema.notEmptyString(),
  orderCreatorId: Schema.notEmptyString(),
  paymentMethod: Schema.enum(PaymentMethod),
});

export type CreateOrderDraft = SchemaType<typeof createOrderDraftSchema>;
