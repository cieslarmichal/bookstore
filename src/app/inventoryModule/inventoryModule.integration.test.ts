import 'reflect-metadata';

import { InventoryRepositoryFactory } from './application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryService } from './application/services/inventoryService/inventoryService';
import { InventoryServiceImpl } from './application/services/inventoryService/inventoryServiceImpl';
import { InventoryController } from './infrastructure/httpControllers/inventoryController';
import { InventoryMapper } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapper';
import { InventoryMapperImpl } from './infrastructure/repositories/inventoryRepository/inventoryMapper/inventoryMapperImpl';
import { InventoryRepositoryFactoryImpl } from './infrastructure/repositories/inventoryRepository/inventoryRepositoryFactoryImpl';
import { InventoryModule } from './inventoryModule';
import { inventoryModuleSymbols } from './inventoryModuleSymbols';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('InventoryModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new InventoryModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<InventoryMapper>(inventoryModuleSymbols.inventoryMapper)).toBeInstanceOf(InventoryMapperImpl);

    expect(container.get<InventoryRepositoryFactory>(inventoryModuleSymbols.inventoryRepositoryFactory)).toBeInstanceOf(
      InventoryRepositoryFactoryImpl,
    );

    expect(container.get<InventoryService>(inventoryModuleSymbols.inventoryService)).toBeInstanceOf(
      InventoryServiceImpl,
    );

    expect(container.get<InventoryController>(inventoryModuleSymbols.inventoryController)).toBeInstanceOf(
      InventoryController,
    );
  });
});
