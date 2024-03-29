import { OrderStatus } from './orderStatus';
import { PaymentMethod } from './paymentMethod';
import { Schema } from '../../../../../../libs/validator/schema';
import { SchemaType } from '../../../../../../libs/validator/schemaType';
import { Validator } from '../../../../../../libs/validator/validator';

export const orderInputSchema = Schema.object({
  id: Schema.string(),
  cartId: Schema.string(),
  customerId: Schema.string(),
  orderNumber: Schema.string(),
  status: Schema.enum(OrderStatus),
  paymentMethod: Schema.enum(PaymentMethod),
});

export type OrderInput = SchemaType<typeof orderInputSchema>;

export class Order {
  public readonly id: string;
  public readonly cartId: string;
  public readonly customerId: string;
  public readonly orderNumber: string;
  public readonly status: OrderStatus;
  public readonly paymentMethod: PaymentMethod;

  public constructor(input: OrderInput) {
    const { id, cartId, customerId, orderNumber, status, paymentMethod } = Validator.validate(orderInputSchema, input);

    this.id = id;
    this.cartId = cartId;
    this.customerId = customerId;
    this.orderNumber = orderNumber;
    this.status = status;
    this.paymentMethod = paymentMethod;
  }
}
