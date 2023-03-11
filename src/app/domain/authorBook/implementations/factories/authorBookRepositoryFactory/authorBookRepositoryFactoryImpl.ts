import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { authorBookSymbols } from '../../../authorBookSymbols';
import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';
import { AuthorBookRepository } from '../../../contracts/repositories/authorBookRepository/authorBookRepository';
import { AuthorBookRepositoryImpl } from '../../repositories/authorBookRepository/authorBookRepositoryImpl';

@Injectable()
export class AuthorBookRepositoryFactoryImpl implements AuthorBookRepositoryFactory {
  public constructor(
    @Inject(authorBookSymbols.authorBookMapper)
    private readonly authorBookMapper: AuthorBookMapper,
  ) {}

  public create(entityManager: EntityManager): AuthorBookRepository {
    return new AuthorBookRepositoryImpl(entityManager, this.authorBookMapper);
  }
}
