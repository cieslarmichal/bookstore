import { InventoryRepositoryFactory } from './contracts/factories/inventoryRepositoryFactory/inventoryRepositoryFactory';
import { InventoryMapper } from './contracts/mappers/inventoryMapper/inventoryMapper';
import { InventoryService } from './contracts/services/inventoryService/inventoryService';
import { InventoryRepositoryFactoryImpl } from './implementations/factories/inventoryRepositoryFactory/inventoryRepositoryFactoryImpl';
import { InventoryMapperImpl } from './implementations/mappers/inventoryMapper/inventoryMapperImpl';
import { InventoryServiceImpl } from './implementations/services/inventoryService/inventoryServiceImpl';
import { inventorySymbols } from './inventorySymbols';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class InventoryModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<InventoryMapper>(inventorySymbols.inventoryMapper, InventoryMapperImpl);

    container.bindToConstructor<InventoryRepositoryFactory>(
      inventorySymbols.inventoryRepositoryFactory,
      InventoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<InventoryService>(inventorySymbols.inventoryService, InventoryServiceImpl);
  }
}
