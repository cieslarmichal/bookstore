import { EntityManager } from 'typeorm';

import { LineItemMapper } from './lineItemMapper/lineItemMapper';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { LineItemRepository } from '../../../application/repositories/lineItemRepository/lineItemRepository';
import { LineItemRepositoryFactory } from '../../../application/repositories/lineItemRepository/lineItemRepositoryFactory';
import { lineItemModuleSymbols } from '../../../lineItemModuleSymbols';
import { LineItemRepositoryImpl } from '../../repositories/lineItemRepository/lineItemRepositoryImpl';

@Injectable()
export class LineItemRepositoryFactoryImpl implements LineItemRepositoryFactory {
  public constructor(
    @Inject(lineItemModuleSymbols.lineItemMapper)
    private readonly lineItemMapper: LineItemMapper,
  ) {}

  public create(entityManager: EntityManager): LineItemRepository {
    return new LineItemRepositoryImpl(entityManager, this.lineItemMapper);
  }
}
