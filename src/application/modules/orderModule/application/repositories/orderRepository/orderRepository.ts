import { CreateOrderPayload } from './payloads/createOrderPayload';
import { FindOrderPayload } from './payloads/findOrderPayload';
import { FindOrdersPayload } from './payloads/findOrdersPayload';
import { Order } from '../../../domain/entities/order/order';

export interface OrderRepository {
  createOrder(input: CreateOrderPayload): Promise<Order>;
  findOrder(input: FindOrderPayload): Promise<Order | null>;
  findOrders(input: FindOrdersPayload): Promise<Order[]>;
}
