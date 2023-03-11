import { EntityManager } from 'typeorm';

import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { cartSymbols } from '../../../cartSymbols';
import { CartRepositoryFactory } from '../../../contracts/factories/cartRepositoryFactory/cartRepositoryFactory';
import { CartMapper } from '../../../contracts/mappers/cartMapper/cartMapper';
import { CartRepository } from '../../../contracts/repositories/cartRepository/cartRepository';
import { CartRepositoryImpl } from '../../repositories/cartRepository/cartRepositoryImpl';

@Injectable()
export class CartRepositoryFactoryImpl implements CartRepositoryFactory {
  public constructor(
    @Inject(cartSymbols.cartMapper)
    private readonly cartMapper: CartMapper,
  ) {}

  public create(entityManager: EntityManager): CartRepository {
    return new CartRepositoryImpl(entityManager, this.cartMapper);
  }
}
