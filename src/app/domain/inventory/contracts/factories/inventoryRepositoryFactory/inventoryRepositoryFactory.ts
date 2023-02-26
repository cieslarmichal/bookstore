import { EntityManager } from 'typeorm';

import { InventoryRepository } from '../../repositories/inventoryRepository/inventoryRepository';

export interface InventoryRepositoryFactory {
  create(entityManager: EntityManager): InventoryRepository;
}
