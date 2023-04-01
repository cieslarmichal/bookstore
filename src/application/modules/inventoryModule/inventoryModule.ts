import { InventoryRepositoryFactory } from './application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryService } from './application/services/inventoryService/inventoryService';
import { InventoryServiceImpl } from './application/services/inventoryService/inventoryServiceImpl';
import { InventoryController } from './infrastructure/httpControllers/inventoryController';
import { InventoryMapper } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapper';
import { InventoryMapperImpl } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapperImpl';
import { InventoryRepositoryFactoryImpl } from './infrastructure/repositories/inventoryRepository/inventoryRepositoryFactoryImpl';
import { inventoryModuleSymbols } from './inventoryModuleSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class InventoryModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<InventoryMapper>(inventoryModuleSymbols.inventoryMapper, InventoryMapperImpl);

    container.bindToConstructor<InventoryRepositoryFactory>(
      inventoryModuleSymbols.inventoryRepositoryFactory,
      InventoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<InventoryService>(inventoryModuleSymbols.inventoryService, InventoryServiceImpl);

    container.bindToConstructor<InventoryController>(inventoryModuleSymbols.inventoryController, InventoryController);
  }
}
