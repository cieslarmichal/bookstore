import { EntityManager } from 'typeorm';

import { LineItemRepository } from './lineItemRepository';

export interface LineItemRepositoryFactory {
  create(entityManager: EntityManager): LineItemRepository;
}
