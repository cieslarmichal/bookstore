import 'reflect-metadata';

import { CartHttpController } from './api/httpControllers/cartHttpController/cartHttpController';
import { OrderHttpController } from './api/httpControllers/orderController/orderHttpController/orderHttpController';
import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from './application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from './application/repositories/orderRepository/orderRepositoryFactory';
import { CartRepositoryFactoryImpl } from './infrastructure/repositories/cartRepository/cartRepositoryFactoryImpl';
import { LineItemRepositoryFactoryImpl } from './infrastructure/repositories/lineItemRepository/lineItemRepositoryFactoryImpl';
import { OrderRepositoryFactoryImpl } from './infrastructure/repositories/orderRepository/orderRepositoryFactoryImpl';
import { orderSymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('OrderModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
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
