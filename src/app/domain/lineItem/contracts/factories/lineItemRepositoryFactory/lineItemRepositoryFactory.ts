import { EntityManager } from 'typeorm';

import { LineItemRepository } from '../../repositories/lineItemRepository/lineItemRepository';

export interface LineItemRepositoryFactory {
  create(entityManager: EntityManager): LineItemRepository;
}
