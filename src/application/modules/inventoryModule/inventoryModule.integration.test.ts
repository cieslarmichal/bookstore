import 'reflect-metadata';

import { InventoryHttpController } from './api/httpControllers/inventoryHttpController/inventoryHttpController';
import { InventoryRepositoryFactory } from './application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryRepositoryFactoryImpl } from './infrastructure/repositories/inventoryRepository/inventoryRepositoryFactoryImpl';
import { InventoryModule } from './inventoryModule';
import { inventorySymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('InventoryModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new InventoryModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<InventoryRepositoryFactory>(inventorySymbols.inventoryRepositoryFactory)).toBeInstanceOf(
      InventoryRepositoryFactoryImpl,
    );

    expect(container.get<InventoryHttpController>(inventorySymbols.inventoryHttpController)).toBeInstanceOf(
      InventoryHttpController,
    );
  });
});
