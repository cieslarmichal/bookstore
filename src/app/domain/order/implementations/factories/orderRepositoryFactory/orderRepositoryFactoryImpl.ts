import { EntityManager } from 'typeorm';

import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { OrderRepositoryFactory } from '../../../contracts/factories/orderRepositoryFactory/orderRepositoryFactory';
import { OrderMapper } from '../../../contracts/mappers/orderMapper/orderMapper';
import { OrderRepository } from '../../../contracts/repositories/orderRepository/orderRepository';
import { orderSymbols } from '../../../orderSymbols';
import { OrderRepositoryImpl } from '../../repositories/orderRepository/orderRepositoryImpl';

@Injectable()
export class OrderRepositoryFactoryImpl implements OrderRepositoryFactory {
  public constructor(
    @Inject(orderSymbols.orderMapper)
    private readonly orderMapper: OrderMapper,
  ) {}

  public create(entityManager: EntityManager): OrderRepository {
    return new OrderRepositoryImpl(entityManager, this.orderMapper);
  }
}
