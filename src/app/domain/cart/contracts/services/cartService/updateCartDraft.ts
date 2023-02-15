import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { CartStatus } from '../../cartStatus';
import { DeliveryMethod } from '../../deliveryMethod';

export const updateCartDraftSchema = Schema.object({
  status: Schema.enum(CartStatus).optional(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
});

export type UpdateCartDraft = SchemaType<typeof updateCartDraftSchema>;
