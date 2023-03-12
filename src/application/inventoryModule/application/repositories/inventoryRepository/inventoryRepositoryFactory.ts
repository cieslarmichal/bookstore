import { EntityManager } from 'typeorm';

import { InventoryRepository } from './inventoryRepository';

export interface InventoryRepositoryFactory {
  create(entityManager: EntityManager): InventoryRepository;
}
