import { InventoryRepositoryFactory } from './application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryService } from './application/services/inventoryService/inventoryService';
import { InventoryServiceImpl } from './application/services/inventoryService/inventoryServiceImpl';
import { InventoryMapper } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapper';
import { InventoryMapperImpl } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapperImpl';
import { InventoryRepositoryFactoryImpl } from './infrastructure/repositories/inventoryRepository/inventoryRepositoryFactoryImpl';
import { inventoryModuleSymbols } from './inventoryModuleSymbols';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class InventoryModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<InventoryMapper>(inventoryModuleSymbols.inventoryMapper, InventoryMapperImpl);

    container.bindToConstructor<InventoryRepositoryFactory>(
      inventoryModuleSymbols.inventoryRepositoryFactory,
      InventoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<InventoryService>(inventoryModuleSymbols.inventoryService, InventoryServiceImpl);
  }
}
