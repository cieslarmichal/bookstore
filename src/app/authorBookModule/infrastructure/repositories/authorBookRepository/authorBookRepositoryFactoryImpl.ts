import { EntityManager } from 'typeorm';

import { AuthorBookMapper } from './authorBookMapper/authorBookMapper';
import { AuthorBookRepositoryImpl } from './authorBookRepositoryImpl';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { AuthorBookRepository } from '../../../application/repositories/authorBookRepository/authorBookRepository';
import { AuthorBookRepositoryFactory } from '../../../application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { authorBookModuleSymbols } from '../../../authorBookModuleSymbols';

@Injectable()
export class AuthorBookRepositoryFactoryImpl implements AuthorBookRepositoryFactory {
  public constructor(
    @Inject(authorBookModuleSymbols.authorBookMapper)
    private readonly authorBookMapper: AuthorBookMapper,
  ) {}

  public create(entityManager: EntityManager): AuthorBookRepository {
    return new AuthorBookRepositoryImpl(entityManager, this.authorBookMapper);
  }
}
