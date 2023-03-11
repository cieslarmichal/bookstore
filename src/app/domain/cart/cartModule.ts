import { cartSymbols } from './cartSymbols';
import { CartRepositoryFactory } from './contracts/factories/cartRepositoryFactory/cartRepositoryFactory';
import { CartMapper } from './contracts/mappers/cartMapper/cartMapper';
import { CartService } from './contracts/services/cartService/cartService';
import { CartRepositoryFactoryImpl } from './implementations/factories/cartRepositoryFactory/cartRepositoryFactoryImpl';
import { CartMapperImpl } from './implementations/mappers/cartMapper/cartMapperImpl';
import { CartServiceImpl } from './implementations/services/cartService/cartServiceImpl';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class CartModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<CartMapper>(cartSymbols.cartMapper, CartMapperImpl);

    container.bindToConstructor<CartRepositoryFactory>(cartSymbols.cartRepositoryFactory, CartRepositoryFactoryImpl);

    container.bindToConstructor<CartService>(cartSymbols.cartService, CartServiceImpl);
  }
}
