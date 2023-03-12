import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { CartService } from './application/services/cartService/cartService';
import { CartServiceImpl } from './application/services/cartService/cartServiceImpl';
import { cartModuleSymbols } from './cartModuleSymbols';
import { CartController } from './infrastructure/httpControllers/cartController';
import { CartMapper } from './infrastructure/repositories/cartRepository/cartMapper/cartMapper';
import { CartMapperImpl } from './infrastructure/repositories/cartRepository/cartMapper/cartMapperImpl';
import { CartRepositoryFactoryImpl } from './infrastructure/repositories/cartRepository/cartRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class CartModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<CartMapper>(cartModuleSymbols.cartMapper, CartMapperImpl);

    container.bindToConstructor<CartRepositoryFactory>(
      cartModuleSymbols.cartRepositoryFactory,
      CartRepositoryFactoryImpl,
    );

    container.bindToConstructor<CartService>(cartModuleSymbols.cartService, CartServiceImpl);

    container.bindToConstructor<CartController>(cartModuleSymbols.cartController, CartController);
  }
}
