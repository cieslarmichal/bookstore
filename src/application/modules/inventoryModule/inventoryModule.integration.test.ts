import 'reflect-metadata';

import { InventoryHttpController } from './api/httpControllers/inventoryHttpController/inventoryHttpController';
import { InventoryRepositoryFactory } from './application/repositories/inventoryRepository/inventoryRepositoryFactory';
import { InventoryRepositoryFactoryImpl } from './infrastructure/repositories/inventoryRepository/inventoryRepositoryFactoryImpl';
import { inventorySymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('InventoryModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
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
