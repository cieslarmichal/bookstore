import { Schema } from '../../../../../../../../libs/validator/schema';
import { OrderStatus } from '../../../../../domain/entities/order/orderStatus';
import { PaymentMethod } from '../../../../../domain/entities/order/paymentMethod';

export const orderSchema = Schema.object({
  id: Schema.notEmptyString(),
  cartId: Schema.notEmptyString(),
  customerId: Schema.notEmptyString(),
  orderNumber: Schema.notEmptyString(),
  status: Schema.enum(OrderStatus),
  paymentMethod: Schema.enum(PaymentMethod),
});
