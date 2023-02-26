import 'reflect-metadata';

import { OrderRepositoryFactory } from './contracts/factories/orderRepositoryFactory/orderRepositoryFactory';
import { OrderMapper } from './contracts/mappers/orderMapper/orderMapper';
import { OrderService } from './contracts/services/orderService/orderService';
import { OrderRepositoryFactoryImpl } from './implementations/factories/orderRepositoryFactory/orderRepositoryFactoryImpl';
import { OrderMapperImpl } from './implementations/mappers/orderMapper/orderMapperImpl';
import { OrderServiceImpl } from './implementations/services/orderService/orderServiceImpl';
import { OrderModule } from './orderModule';
import { orderSymbols } from './orderSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { AddressModule } from '../address/addressModule';
import { BookModule } from '../book/bookModule';
import { CartModule } from '../cart/cartModule';
import { InventoryModule } from '../inventory/inventoryModule';
import { LineItemModule } from '../lineItem/lineItemModule';

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
    expect.assertions(3);

    expect(container.get<OrderMapper>(orderSymbols.orderMapper)).toBeInstanceOf(OrderMapperImpl);

    expect(container.get<OrderRepositoryFactory>(orderSymbols.orderRepositoryFactory)).toBeInstanceOf(
      OrderRepositoryFactoryImpl,
    );

    expect(container.get<OrderService>(orderSymbols.orderService)).toBeInstanceOf(OrderServiceImpl);
  });
});
