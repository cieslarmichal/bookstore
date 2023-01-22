import { EntityManager } from 'typeorm';

import { AuthorBookRepositoryFactory } from '../../../contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookMapper } from '../../../contracts/mappers/authorBookMapper/authorBookMapper';
import { AuthorBookRepository } from '../../../contracts/repositories/authorBookRepository/authorBookRepository';
import { AuthorBookRepositoryImpl } from '../../repositories/authorBookRepository/authorBookRepositoryImpl';

export class AuthorBookRepositoryFactoryImpl implements AuthorBookRepositoryFactory {
  public constructor(private readonly authorBookMapper: AuthorBookMapper) {}

  public create(entityManager: EntityManager): AuthorBookRepository {
    return new AuthorBookRepositoryImpl(entityManager, this.authorBookMapper);
  }
}
