import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { WhishlistEntryRepositoryFactory } from '../../../contracts/factories/whishlistEntryRepositoryFactory/whishlistEntryRepositoryFactory';
import { WhishlistEntryMapper } from '../../../contracts/mappers/whishlistEntryMapper/whishlistEntryMapper';
import { WhishlistEntryRepository } from '../../../contracts/repositories/whishlistEntryRepository/whishlistEntryRepository';
import { whishlistSymbols } from '../../../whishlistSymbols';
import { WhishlistEntryRepositoryImpl } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryImpl';

@Injectable()
export class WhishlistEntryRepositoryFactoryImpl implements WhishlistEntryRepositoryFactory {
  public constructor(
    @Inject(whishlistSymbols.whishlistEntryMapper)
    private readonly whishlistEntryMapper: WhishlistEntryMapper,
  ) {}

  public create(entityManager: EntityManager): WhishlistEntryRepository {
    return new WhishlistEntryRepositoryImpl(entityManager, this.whishlistEntryMapper);
  }
}
