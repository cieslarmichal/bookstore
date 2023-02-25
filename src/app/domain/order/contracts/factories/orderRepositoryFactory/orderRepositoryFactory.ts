import { EntityManager } from 'typeorm';

import { OrderRepository } from '../../repositories/orderRepository/orderRepository';

export interface OrderRepositoryFactory {
  create(entityManager: EntityManager): OrderRepository;
}
