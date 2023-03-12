import 'reflect-metadata';

import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from './application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from './application/repositories/orderRepository/orderRepositoryFactory';
import { CartService } from './application/services/cartService/cartService';
import { CartServiceImpl } from './application/services/cartService/cartServiceImpl';
import { OrderService } from './application/services/orderService/orderService';
import { OrderServiceImpl } from './application/services/orderService/orderServiceImpl';
import { CartController } from './infrastructure/httpControllers/cartController/cartController';
import { OrderController } from './infrastructure/httpControllers/orderController/orderController';
import { CartMapper } from './infrastructure/repositories/cartRepository/cartMapper/cartMapper';
import { CartMapperImpl } from './infrastructure/repositories/cartRepository/cartMapper/cartMapperImpl';
import { CartRepositoryFactoryImpl } from './infrastructure/repositories/cartRepository/cartRepositoryFactoryImpl';
import { LineItemMapper } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapper';
import { LineItemMapperImpl } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapperImpl';
import { LineItemRepositoryFactoryImpl } from './infrastructure/repositories/lineItemRepository/lineItemRepositoryFactoryImpl';
import { OrderMapper } from './infrastructure/repositories/orderRepository/orderMapper/orderMapper';
import { OrderMapperImpl } from './infrastructure/repositories/orderRepository/orderMapper/orderMapperImpl';
import { OrderRepositoryFactoryImpl } from './infrastructure/repositories/orderRepository/orderRepositoryFactoryImpl';
import { OrderModule } from './orderModule';
import { orderModuleSymbols } from './orderModuleSymbols';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { AddressModule } from '../addressModule/addressModule';
import { BookModule } from '../bookModule/bookModule';
import { InventoryModule } from '../inventoryModule/inventoryModule';

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

    expect(container.get<CartMapper>(orderModuleSymbols.cartMapper)).toBeInstanceOf(CartMapperImpl);

    expect(container.get<CartRepositoryFactory>(orderModuleSymbols.cartRepositoryFactory)).toBeInstanceOf(
      CartRepositoryFactoryImpl,
    );

    expect(container.get<CartService>(orderModuleSymbols.cartService)).toBeInstanceOf(CartServiceImpl);

    expect(container.get<CartController>(orderModuleSymbols.cartController)).toBeInstanceOf(CartController);

    expect(container.get<LineItemMapper>(orderModuleSymbols.lineItemMapper)).toBeInstanceOf(LineItemMapperImpl);

    expect(container.get<LineItemRepositoryFactory>(orderModuleSymbols.lineItemRepositoryFactory)).toBeInstanceOf(
      LineItemRepositoryFactoryImpl,
    );
  });
});
