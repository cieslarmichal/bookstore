import { EntityManager } from 'typeorm';

import { CartRepository } from '../../repositories/cartRepository/cartRepository';

export interface CartRepositoryFactory {
  create(entityManager: EntityManager): CartRepository;
}
