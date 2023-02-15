import { SchemaType } from '../../../../../common/validator/contracts/schemaType';
import { Schema } from '../../../../../common/validator/implementations/schema';
import { CartStatus } from '../../cartStatus';
import { DeliveryMethod } from '../../deliveryMethod';

export const updateOneDraftSchema = Schema.object({
  status: Schema.enum(CartStatus).optional(),
  totalPrice: Schema.number().optional(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
});

export type UpdateOneDraft = SchemaType<typeof updateOneDraftSchema>;
