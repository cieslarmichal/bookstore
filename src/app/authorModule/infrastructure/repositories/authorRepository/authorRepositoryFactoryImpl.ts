import { EntityManager } from 'typeorm';

import { AuthorMapper } from './authorMapper/authorMapper';
import { AuthorRepositoryImpl } from './authorRepositoryImpl';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { AuthorRepository } from '../../../application/repositories/authorRepository/authorRepository';
import { AuthorRepositoryFactory } from '../../../application/repositories/authorRepository/authorRepositoryFactory';
import { authorModuleSymbols } from '../../../authorModuleSymbols';

@Injectable()
export class AuthorRepositoryFactoryImpl implements AuthorRepositoryFactory {
  public constructor(
    @Inject(authorModuleSymbols.authorMapper)
    private readonly authorMapper: AuthorMapper,
  ) {}

  public create(entityManager: EntityManager): AuthorRepository {
    return new AuthorRepositoryImpl(entityManager, this.authorMapper);
  }
}
