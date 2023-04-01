import { EntityManager } from 'typeorm';

import { OrderRepository } from './orderRepository';

export interface OrderRepositoryFactory {
  create(entityManager: EntityManager): OrderRepository;
}
