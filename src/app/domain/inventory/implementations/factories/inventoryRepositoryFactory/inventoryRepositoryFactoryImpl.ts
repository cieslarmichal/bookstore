import { EntityManager } from 'typeorm';

import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { InventoryRepositoryFactory } from '../../../contracts/factories/inventoryRepositoryFactory/inventoryRepositoryFactory';
import { InventoryMapper } from '../../../contracts/mappers/inventoryMapper/inventoryMapper';
import { InventoryRepository } from '../../../contracts/repositories/inventoryRepository/inventoryRepository';
import { inventorySymbols } from '../../../inventorySymbols';
import { InventoryRepositoryImpl } from '../../repositories/inventoryRepository/inventoryRepositoryImpl';

@Injectable()
export class InventoryRepositoryFactoryImpl implements InventoryRepositoryFactory {
  public constructor(
    @Inject(inventorySymbols.inventoryMapper)
    private readonly inventoryMapper: InventoryMapper,
  ) {}

  public create(entityManager: EntityManager): InventoryRepository {
    return new InventoryRepositoryImpl(entityManager, this.inventoryMapper);
  }
}
