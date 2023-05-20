import { CartHttpController } from './api/httpControllers/cartHttpController/cartHttpController';
import { OrderHttpController } from './api/httpControllers/orderController/orderHttpController/orderHttpController';
import { AddLineItemCommandHandler } from './application/commandHandlers/addLineItemCommandHandler/addLineItemCommandHandler';
import { AddLineItemCommandHandlerImpl } from './application/commandHandlers/addLineItemCommandHandler/addLineItemCommandHandlerImpl';
import { CreateCartCommandHandler } from './application/commandHandlers/createCartCommandHandler/createCartCommandHandler';
import { CreateCartCommandHandlerImpl } from './application/commandHandlers/createCartCommandHandler/createCartCommandHandlerImpl';
import { CreateOrderCommandHandler } from './application/commandHandlers/createOrderCommandHandler/createOrderCommandHandler';
import { CreateOrderCommandHandlerImpl } from './application/commandHandlers/createOrderCommandHandler/createOrderCommandHandlerImpl';
import { DeleteCartCommandHandler } from './application/commandHandlers/deleteCartCommandHandler/deleteCartCommandHandler';
import { DeleteCartCommandHandlerImpl } from './application/commandHandlers/deleteCartCommandHandler/deleteCartCommandHandlerImpl';
import { RemoveLineItemCommandHandler } from './application/commandHandlers/removeLineItemCommandHandler/removeLineItemCommandHandler';
import { RemoveLineItemCommandHandlerImpl } from './application/commandHandlers/removeLineItemCommandHandler/removeLineItemCommandHandlerImpl';
import { UpdateCartCommandHandler } from './application/commandHandlers/updateCartCommandHandler/updateCartCommandHandler';
import { UpdateCartCommandHandlerImpl } from './application/commandHandlers/updateCartCommandHandler/updateCartCommandHandlerImpl';
import { FindCartQueryHandler } from './application/queryHandlers/findCartQueryHandler/findCartQueryHandler';
import { FindCartQueryHandlerImpl } from './application/queryHandlers/findCartQueryHandler/findCartQueryHandlerImpl';
import { FindCartsQueryHandler } from './application/queryHandlers/findCartsQueryHandler/findCartsQueryHandler';
import { FindCartsQueryHandlerImpl } from './application/queryHandlers/findCartsQueryHandler/findCartsQueryHandlerImpl';
import { FindOrdersQueryHandler } from './application/queryHandlers/findOrdersQueryHandler/findOrdersQueryHandler';
import { FindOrdersQueryHandlerImpl } from './application/queryHandlers/findOrdersQueryHandler/findOrdersQueryHandlerImpl';
import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { LineItemRepositoryFactory } from './application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { OrderRepositoryFactory } from './application/repositories/orderRepository/orderRepositoryFactory';
import { CartValidatorService } from './application/services/cartValidatorService/cartValidatorService';
import { CartValidatorServiceImpl } from './application/services/cartValidatorService/cartValidatorServiceImpl';
import { CartMapper } from './infrastructure/repositories/cartRepository/cartMapper/cartMapper';
import { CartMapperImpl } from './infrastructure/repositories/cartRepository/cartMapper/cartMapperImpl';
import { CartRepositoryFactoryImpl } from './infrastructure/repositories/cartRepository/cartRepositoryFactoryImpl';
import { LineItemMapper } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapper';
import { LineItemMapperImpl } from './infrastructure/repositories/lineItemRepository/lineItemMapper/lineItemMapperImpl';
import { LineItemRepositoryFactoryImpl } from './infrastructure/repositories/lineItemRepository/lineItemRepositoryFactoryImpl';
import { OrderMapper } from './infrastructure/repositories/orderRepository/orderMapper/orderMapper';
import { OrderMapperImpl } from './infrastructure/repositories/orderRepository/orderMapper/orderMapperImpl';
import { OrderRepositoryFactoryImpl } from './infrastructure/repositories/orderRepository/orderRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class OrderModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<OrderMapper>(symbols.orderMapper, OrderMapperImpl);

    container.bindToConstructor<OrderRepositoryFactory>(symbols.orderRepositoryFactory, OrderRepositoryFactoryImpl);

    container.bindToConstructor<CartValidatorService>(symbols.cartValidatorService, CartValidatorServiceImpl);

    container.bindToConstructor<OrderHttpController>(symbols.orderHttpController, OrderHttpController);

    container.bindToConstructor<CartMapper>(symbols.cartMapper, CartMapperImpl);

    container.bindToConstructor<CartRepositoryFactory>(symbols.cartRepositoryFactory, CartRepositoryFactoryImpl);

    container.bindToConstructor<CartHttpController>(symbols.cartHttpController, CartHttpController);

    container.bindToConstructor<LineItemMapper>(symbols.lineItemMapper, LineItemMapperImpl);

    container.bindToConstructor<LineItemRepositoryFactory>(
      symbols.lineItemRepositoryFactory,
      LineItemRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateCartCommandHandler>(
      symbols.createCartCommandHandler,
      CreateCartCommandHandlerImpl,
    );

    container.bindToConstructor<UpdateCartCommandHandler>(
      symbols.updateCartCommandHandler,
      UpdateCartCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteCartCommandHandler>(
      symbols.deleteCartCommandHandler,
      DeleteCartCommandHandlerImpl,
    );

    container.bindToConstructor<FindCartQueryHandler>(symbols.findCartQueryHandler, FindCartQueryHandlerImpl);

    container.bindToConstructor<FindCartsQueryHandler>(symbols.findCartsQueryHandler, FindCartsQueryHandlerImpl);

    container.bindToConstructor<AddLineItemCommandHandler>(
      symbols.addLineItemCommandHandler,
      AddLineItemCommandHandlerImpl,
    );

    container.bindToConstructor<RemoveLineItemCommandHandler>(
      symbols.removeLineItemCommandHandler,
      RemoveLineItemCommandHandlerImpl,
    );

    container.bindToConstructor<CreateOrderCommandHandler>(
      symbols.createOrderCommandHandler,
      CreateOrderCommandHandlerImpl,
    );

    container.bindToConstructor<FindOrdersQueryHandler>(symbols.findOrdersQueryHandler, FindOrdersQueryHandlerImpl);
  }
}
