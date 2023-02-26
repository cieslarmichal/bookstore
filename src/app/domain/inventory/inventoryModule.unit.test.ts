import 'reflect-metadata';

import { InventoryRepositoryFactory } from './contracts/factories/inventoryRepositoryFactory/inventoryRepositoryFactory';
import { InventoryMapper } from './contracts/mappers/inventoryMapper/inventoryMapper';
import { InventoryService } from './contracts/services/inventoryService/inventoryService';
import { InventoryRepositoryFactoryImpl } from './implementations/factories/inventoryRepositoryFactory/inventoryRepositoryFactoryImpl';
import { InventoryMapperImpl } from './implementations/mappers/inventoryMapper/inventoryMapperImpl';
import { InventoryServiceImpl } from './implementations/services/inventoryService/inventoryServiceImpl';
import { InventoryModule } from './inventoryModule';
import { inventorySymbols } from './inventorySymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
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
    expect.assertions(3);

    expect(container.get<InventoryMapper>(inventorySymbols.inventoryMapper)).toBeInstanceOf(InventoryMapperImpl);

    expect(container.get<InventoryRepositoryFactory>(inventorySymbols.inventoryRepositoryFactory)).toBeInstanceOf(
      InventoryRepositoryFactoryImpl,
    );

    expect(container.get<InventoryService>(inventorySymbols.inventoryService)).toBeInstanceOf(InventoryServiceImpl);
  });
});
