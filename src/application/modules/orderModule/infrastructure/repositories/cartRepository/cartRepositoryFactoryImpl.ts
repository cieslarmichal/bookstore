import { EntityManager } from 'typeorm';

import { CartMapper } from './cartMapper/cartMapper';
import { CartRepositoryImpl } from './cartRepositoryImpl';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { CartRepository } from '../../../application/repositories/cartRepository/cartRepository';
import { CartRepositoryFactory } from '../../../application/repositories/cartRepository/cartRepositoryFactory';
import { orderSymbols } from '../../../symbols';

@Injectable()
export class CartRepositoryFactoryImpl implements CartRepositoryFactory {
  public constructor(
    @Inject(orderSymbols.cartMapper)
    private readonly cartMapper: CartMapper,
  ) {}

  public create(entityManager: EntityManager): CartRepository {
    return new CartRepositoryImpl(entityManager, this.cartMapper);
  }
}
