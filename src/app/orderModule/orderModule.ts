import { OrderRepositoryFactory } from './application/repositories/orderRepository/orderRepositoryFactory';
import { CartValidatorService } from './application/services/cartValidatorService/cartValidatorService';
import { CartValidatorServiceImpl } from './application/services/cartValidatorService/cartValidatorServiceImpl';
import { OrderService } from './application/services/orderService/orderService';
import { OrderServiceImpl } from './application/services/orderService/orderServiceImpl';
import { OrderController } from './infrastructure/httpControllers/orderController';
import { OrderMapper } from './infrastructure/repositories/orderRepository/orderMapper/orderMapper';
import { OrderMapperImpl } from './infrastructure/repositories/orderRepository/orderMapper/orderMapperImpl';
import { OrderRepositoryFactoryImpl } from './infrastructure/repositories/orderRepository/orderRepositoryFactoryImpl';
import { orderModuleSymbols } from './orderModuleSymbols';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class OrderModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
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
  }
}
