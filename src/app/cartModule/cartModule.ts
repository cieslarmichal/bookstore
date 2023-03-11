import { CartRepositoryFactory } from './application/repositories/cartRepository/cartRepositoryFactory';
import { CartService } from './application/services/cartService/cartService';
import { CartServiceImpl } from './application/services/cartService/cartServiceImpl';
import { cartSymbols } from './cartSymbols';
import { CartMapper } from './infrastructure/repositories/cartRepository/cartMapper/cartMapper';
import { CartMapperImpl } from './infrastructure/repositories/cartRepository/cartMapper/cartMapperImpl';
import { CartRepositoryFactoryImpl } from './infrastructure/repositories/cartRepository/cartRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class CartModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<CartMapper>(cartSymbols.cartMapper, CartMapperImpl);

    container.bindToConstructor<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory, CartRepositoryFactoryImpl);

    container.bindToConstructor<CartService>(cartSymbols.cartService, CartServiceImpl);
  }
}
