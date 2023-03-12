import 'reflect-metadata';

import { OrderRepositoryFactory } from './application/repositories/orderRepository/orderRepositoryFactory';
import { OrderService } from './application/services/orderService/orderService';
import { OrderServiceImpl } from './application/services/orderService/orderServiceImpl';
import { OrderController } from './infrastructure/httpControllers/orderController';
import { OrderMapper } from './infrastructure/repositories/orderRepository/orderMapper/orderMapper';
import { OrderMapperImpl } from './infrastructure/repositories/orderRepository/orderMapper/orderMapperImpl';
import { OrderRepositoryFactoryImpl } from './infrastructure/repositories/orderRepository/orderRepositoryFactoryImpl';
import { OrderModule } from './orderModule';
import { orderModuleSymbols } from './orderModuleSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { AddressModule } from '../addressModule/addressModule';
import { BookModule } from '../bookModule/bookModule';
import { CartModule } from '../cartModule/cartModule';
import { InventoryModule } from '../inventoryModule/inventoryModule';
import { LineItemModule } from '../lineItemModule/lineItemModule';

describe('OrderModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new OrderModule(),
        new CartModule(),
        new LineItemModule(),
        new BookModule(),
        new InventoryModule(),
        new AddressModule(),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<OrderMapper>(orderModuleSymbols.orderMapper)).toBeInstanceOf(OrderMapperImpl);

    expect(container.get<OrderRepositoryFactory>(orderModuleSymbols.orderRepositoryFactory)).toBeInstanceOf(
      OrderRepositoryFactoryImpl,
    );

    expect(container.get<OrderService>(orderModuleSymbols.orderService)).toBeInstanceOf(OrderServiceImpl);

    expect(container.get<OrderController>(orderModuleSymbols.orderController)).toBeInstanceOf(OrderController);
  });
});
