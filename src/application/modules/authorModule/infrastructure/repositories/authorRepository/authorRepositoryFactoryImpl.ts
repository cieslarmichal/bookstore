import { EntityManager } from 'typeorm';

import { AuthorMapper } from './authorMapper/authorMapper';
import { AuthorRepositoryImpl } from './authorRepositoryImpl';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { AuthorRepository } from '../../../application/repositories/authorRepository/authorRepository';
import { AuthorRepositoryFactory } from '../../../application/repositories/authorRepository/authorRepositoryFactory';
import { symbols } from '../../../symbols';

@Injectable()
export class AuthorRepositoryFactoryImpl implements AuthorRepositoryFactory {
  public constructor(
    @Inject(symbols.authorMapper)
    private readonly authorMapper: AuthorMapper,
  ) {}

  public create(entityManager: EntityManager): AuthorRepository {
    return new AuthorRepositoryImpl(entityManager, this.authorMapper);
  }
}
