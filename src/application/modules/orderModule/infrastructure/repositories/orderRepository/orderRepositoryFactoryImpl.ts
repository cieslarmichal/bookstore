import { EntityManager } from 'typeorm';

import { OrderMapper } from './orderMapper/orderMapper';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { OrderRepository } from '../../../application/repositories/orderRepository/orderRepository';
import { OrderRepositoryFactory } from '../../../application/repositories/orderRepository/orderRepositoryFactory';
import { OrderRepositoryImpl } from '../../../infrastructure/repositories/orderRepository/orderRepositoryImpl';
import { symbols } from '../../../symbols';

@Injectable()
export class OrderRepositoryFactoryImpl implements OrderRepositoryFactory {
  public constructor(
    @Inject(symbols.orderMapper)
    private readonly orderMapper: OrderMapper,
  ) {}

  public create(entityManager: EntityManager): OrderRepository {
    return new OrderRepositoryImpl(entityManager, this.orderMapper);
  }
}
