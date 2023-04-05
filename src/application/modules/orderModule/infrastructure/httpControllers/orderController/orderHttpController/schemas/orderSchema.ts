import { Schema } from '../../../../../../../../libs/validator/schema';
import { OrderStatus } from '../../../../../domain/entities/order/orderStatus';
import { PaymentMethod } from '../../../../../domain/entities/order/paymentMethod';

export const orderSchema = Schema.object({
  id: Schema.string(),
  cartId: Schema.string(),
  customerId: Schema.string(),
  orderNumber: Schema.string(),
  status: Schema.enum(OrderStatus),
  paymentMethod: Schema.enum(PaymentMethod),
});
