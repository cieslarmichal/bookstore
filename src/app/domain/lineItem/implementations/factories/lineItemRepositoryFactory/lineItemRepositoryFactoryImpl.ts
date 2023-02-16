import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { LineItemRepositoryFactory } from '../../../contracts/factories/lineItemRepositoryFactory/lineItemRepositoryFactory';
import { LineItemMapper } from '../../../contracts/mappers/lineItemMapper/lineItemMapper';
import { LineItemRepository } from '../../../contracts/repositories/lineItemRepository/lineItemRepository';
import { lineItemSymbols } from '../../../lineItemSymbols';
import { LineItemRepositoryImpl } from '../../repositories/lineItemRepository/lineItemRepositoryImpl';

@Injectable()
export class LineItemRepositoryFactoryImpl implements LineItemRepositoryFactory {
  public constructor(
    @Inject(lineItemSymbols.lineItemMapper)
    private readonly lineItemMapper: LineItemMapper,
  ) {}

  public create(entityManager: EntityManager): LineItemRepository {
    return new LineItemRepositoryImpl(entityManager, this.lineItemMapper);
  }
}
