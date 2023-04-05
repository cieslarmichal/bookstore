import { Schema } from '../../../../../../../libs/validator/schema';
import { CartStatus } from '../../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../../domain/entities/cart/deliveryMethod';
import { LineItem } from '../../../../domain/entities/lineItem/lineItem';

export const cartSchema = Schema.object({
  id: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
  status: Schema.enum(CartStatus),
  totalPrice: Schema.number(),
  billingAddressId: Schema.notEmptyString().optional(),
  shippingAddressId: Schema.notEmptyString().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
  lineItems: Schema.array(Schema.instanceof(LineItem)).optional(),
});
