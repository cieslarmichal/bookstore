import { EntityManager } from 'typeorm';

import { WhishlistEntryMapper } from './whishlistEntryMapper/whishlistEntryMapper';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { WhishlistEntryRepository } from '../../../application/repositories/whishlistEntryRepository/whishlistEntryRepository';
import { WhishlistEntryRepositoryFactory } from '../../../application/repositories/whishlistEntryRepository/whishlistEntryRepositoryFactory';
import { whishlistModuleSymbols } from '../../../whishlistModuleSymbols';
import { WhishlistEntryRepositoryImpl } from '../../repositories/whishlistEntryRepository/whishlistEntryRepositoryImpl';

@Injectable()
export class WhishlistEntryRepositoryFactoryImpl implements WhishlistEntryRepositoryFactory {
  public constructor(
    @Inject(whishlistModuleSymbols.whishlistEntryMapper)
    private readonly whishlistEntryMapper: WhishlistEntryMapper,
  ) {}

  public create(entityManager: EntityManager): WhishlistEntryRepository {
    return new WhishlistEntryRepositoryImpl(entityManager, this.whishlistEntryMapper);
  }
}