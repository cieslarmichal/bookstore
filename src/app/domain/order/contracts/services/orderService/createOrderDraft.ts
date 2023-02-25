import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { PaymentMethod } from '../../paymentMethod';

export const createOrderDraftSchema = Schema.object({
  cartId: Schema.notEmptyString(),
  orderCreatorId: Schema.notEmptyString(),
  paymentMethod: Schema.enum(PaymentMethod),
});

export type CreateOrderDraft = SchemaType<typeof createOrderDraftSchema>;
