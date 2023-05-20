import 'reflect-metadata';

import { CartHttpController } from './api/httpControllers/cartHttpController/cartHttpController';
import { OrderHttpController } from './api/httpControllers/orderController/orderHttpController/orderHttpController';
import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from './application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from './application/repositories/orderRepository/orderRepositoryFactory';
import { CartRepositoryFactoryImpl } from './infrastructure/repositories/cartRepository/cartRepositoryFactoryImpl';
import { LineItemRepositoryFactoryImpl } from './infrastructure/repositories/lineItemRepository/lineItemRepositoryFactoryImpl';
import { OrderRepositoryFactoryImpl } from './infrastructure/repositories/orderRepository/orderRepositoryFactoryImpl';
import { OrderModule } from './orderModule';
import { orderSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { AddressModule } from '../addressModule/addressModule';
import { BookModule } from '../bookModule/bookModule';
import { InventoryModule } from '../inventoryModule/inventoryModule';

describe('OrderModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new OrderModule(),
        new BookModule(),
        new InventoryModule(),
        new AddressModule(),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<OrderRepositoryFactory>(orderSymbols.orderRepositoryFactory)).toBeInstanceOf(
      OrderRepositoryFactoryImpl,
    );

    expect(container.get<OrderHttpController>(orderSymbols.orderHttpController)).toBeInstanceOf(OrderHttpController);

    expect(container.get<CartRepositoryFactory>(orderSymbols.cartRepositoryFactory)).toBeInstanceOf(
      CartRepositoryFactoryImpl,
    );

    expect(container.get<CartHttpController>(orderSymbols.cartHttpController)).toBeInstanceOf(CartHttpController);

    expect(container.get<LineItemRepositoryFactory>(orderSymbols.lineItemRepositoryFactory)).toBeInstanceOf(
      LineItemRepositoryFactoryImpl,
    );
  });
});
