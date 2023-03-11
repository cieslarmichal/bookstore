import { OrderRepositoryFactory } from './contracts/factories/orderRepositoryFactory/orderRepositoryFactory';
import { OrderMapper } from './contracts/mappers/orderMapper/orderMapper';
import { CartValidatorService } from './contracts/services/cartValidatorService/cartValidatorService';
import { OrderService } from './contracts/services/orderService/orderService';
import { OrderRepositoryFactoryImpl } from './implementations/factories/orderRepositoryFactory/orderRepositoryFactoryImpl';
import { OrderMapperImpl } from './implementations/mappers/orderMapper/orderMapperImpl';
import { CartValidatorServiceImpl } from './implementations/services/cartValidatorService/cartValidatorServiceImpl';
import { OrderServiceImpl } from './implementations/services/orderService/orderServiceImpl';
import { orderSymbols } from './orderSymbols';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class OrderModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<OrderMapper>(orderSymbols.orderMapper, OrderMapperImpl);

    container.bindToConstructor<OrderRepositoryFactory>(
      orderSymbols.orderRepositoryFactory,
      OrderRepositoryFactoryImpl,
    );

    container.bindToConstructor<OrderService>(orderSymbols.orderService, OrderServiceImpl);

    container.bindToConstructor<CartValidatorService>(orderSymbols.cartValidatorService, CartValidatorServiceImpl);
  }
}
