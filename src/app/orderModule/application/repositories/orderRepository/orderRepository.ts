import { CreateOnePayload } from './payloads/createOnePayload';
import { FindManyPayload } from './payloads/findManyPayload';
import { FindOnePayload } from './payloads/findOnePayload';
import { Order } from '../../../domain/entities/order/order';

export interface OrderRepository {
  createOne(input: CreateOnePayload): Promise<Order>;
  findOne(input: FindOnePayload): Promise<Order | null>;
  findMany(input: FindManyPayload): Promise<Order[]>;
}
