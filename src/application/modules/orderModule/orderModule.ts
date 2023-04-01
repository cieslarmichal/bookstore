import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from './application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from './application/repositories/orderRepository/orderRepositoryFactory';
import { CartService } from './application/services/cartService/cartService';
import { CartServiceImpl } from './application/services/cartService/cartServiceImpl';
import { CartValidatorService } from './application/services/cartValidatorService/cartValidatorService';
import { CartValidatorServiceImpl } from './application/services/cartValidatorService/cartValidatorServiceImpl';
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
import { orderModuleSymbols } from './orderModuleSymbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class OrderModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<OrderMapper>(orderModuleSymbols.orderMapper, OrderMapperImpl);

    container.bindToConstructor<OrderRepositoryFactory>(
      orderModuleSymbols.orderRepositoryFactory,
      OrderRepositoryFactoryImpl,
    );

    container.bindToConstructor<OrderService>(orderModuleSymbols.orderService, OrderServiceImpl);

    container.bindToConstructor<CartValidatorService>(
      orderModuleSymbols.cartValidatorService,
      CartValidatorServiceImpl,
    );

    container.bindToConstructor<OrderController>(orderModuleSymbols.orderController, OrderController);

    container.bindToConstructor<CartMapper>(orderModuleSymbols.cartMapper, CartMapperImpl);

    container.bindToConstructor<CartRepositoryFactory>(
      orderModuleSymbols.cartRepositoryFactory,
      CartRepositoryFactoryImpl,
    );

    container.bindToConstructor<CartService>(orderModuleSymbols.cartService, CartServiceImpl);

    container.bindToConstructor<CartController>(orderModuleSymbols.cartController, CartController);

    container.bindToConstructor<LineItemMapper>(orderModuleSymbols.lineItemMapper, LineItemMapperImpl);

    container.bindToConstructor<LineItemRepositoryFactory>(
      orderModuleSymbols.lineItemRepositoryFactory,
      LineItemRepositoryFactoryImpl,
    );
  }
}
