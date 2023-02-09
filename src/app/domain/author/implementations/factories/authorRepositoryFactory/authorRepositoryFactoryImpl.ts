import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { authorSymbols } from '../../../authorSymbols';
import { AuthorRepositoryFactory } from '../../../contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';
import { AuthorRepository } from '../../../contracts/repositories/authorRepository/authorRepository';
import { AuthorRepositoryImpl } from '../../repositories/authorRepository/authorRepositoryImpl';

@Injectable()
export class AuthorRepositoryFactoryImpl implements AuthorRepositoryFactory {
  public constructor(
    @Inject(authorSymbols.authorMapper)
    private readonly authorMapper: AuthorMapper,
  ) {}

  public create(entityManager: EntityManager): AuthorRepository {
    return new AuthorRepositoryImpl(entityManager, this.authorMapper);
  }
}
