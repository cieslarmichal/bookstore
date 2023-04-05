import { Schema } from '../../../../../../../libs/validator/schema';
import { CartStatus } from '../../../../domain/entities/cart/cartStatus';
import { DeliveryMethod } from '../../../../domain/entities/cart/deliveryMethod';
import { LineItem } from '../../../../domain/entities/lineItem/lineItem';

export const cartSchema = Schema.object({
  id: Schema.string(),
  customerId: Schema.string(),
  status: Schema.enum(CartStatus),
  totalPrice: Schema.number(),
  billingAddressId: Schema.string().optional(),
  shippingAddressId: Schema.string().optional(),
  deliveryMethod: Schema.enum(DeliveryMethod).optional(),
  lineItems: Schema.array(Schema.instanceof(LineItem)).optional(),
});
