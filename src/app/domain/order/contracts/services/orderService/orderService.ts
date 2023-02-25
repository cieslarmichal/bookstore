import { CreateOrderPayload } from './createOrderPayload';
import { FindOrdersPayload } from './findOrdersPayload';
import { Order } from '../../order';

export interface OrderService {
  createOrder(input: CreateOrderPayload): Promise<Order>;
  findOrders(input: FindOrdersPayload): Promise<Order[]>;
}
