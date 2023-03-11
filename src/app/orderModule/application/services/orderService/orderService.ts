import { CreateOrderPayload } from './payloads/createOrderPayload';
import { FindOrdersPayload } from './payloads/findOrdersPayload';
import { Order } from '../../../domain/entities/order/order';

export interface OrderService {
  createOrder(input: CreateOrderPayload): Promise<Order>;
  findOrders(input: FindOrdersPayload): Promise<Order[]>;
}
