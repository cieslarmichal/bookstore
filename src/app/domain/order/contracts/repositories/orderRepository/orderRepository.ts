import { CreateOnePayload } from './createOnePayload';
import { FindManyPayload } from './findManyPayload';
import { FindOnePayload } from './findOnePayload';
import { Order } from '../../order';

export interface OrderRepository {
  createOne(input: CreateOnePayload): Promise<Order>;
  findOne(input: FindOnePayload): Promise<Order | null>;
  findMany(input: FindManyPayload): Promise<Order[]>;
}
