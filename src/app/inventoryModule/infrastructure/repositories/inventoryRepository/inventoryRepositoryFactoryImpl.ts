import { EntityManager } from 'typeorm';

import { InventoryMapper } from './inventoryMapper/inventoryMapper';
import { InventoryRepositoryImpl } from './inventoryRepositoryImpl';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { InventoryRepository } from '../../../application/repositories/inventoryRepository/inventoryRepository';
import { InventoryRepositoryFactory } from '../../../application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { inventoryModuleSymbols } from '../../../inventoryModuleSymbols';

@Injectable()
export class InventoryRepositoryFactoryImpl implements InventoryRepositoryFactory {
  public constructor(
    @Inject(inventoryModuleSymbols.inventoryMapper)
    private readonly inventoryMapper: InventoryMapper,
  ) {}

  public create(entityManager: EntityManager): InventoryRepository {
    return new InventoryRepositoryImpl(entityManager, this.inventoryMapper);
  }
}
