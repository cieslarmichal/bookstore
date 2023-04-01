import { Schema } from '../../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../../libs/validator/schemaType';
import { CartStatus } from '../../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../../domain/entities/cart/deliveryMethod';

export const updateCartDraftSchema = Schema.object({
  status: Schema.enum(CartStatus).optional(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
});

export type UpdateCartDraft = SchemaType<typeof updateCartDraftSchema>;
