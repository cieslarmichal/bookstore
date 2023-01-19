import { EntityManager } from 'typeorm';
import { AuthorRepositoryFactory } from '../../../contracts/factories/authorRepositoryFactory/authorRepositoryFactory';
import { AuthorMapper } from '../../../contracts/mappers/authorMapper/authorMapper';
import { AuthorRepository } from '../../../contracts/repositories/authorRepository/authorRepository';
import { AuthorRepositoryImpl } from '../../repositories/authorRepository/authorRepositoryImpl';

export class AuthorRepositoryFactoryImpl implements AuthorRepositoryFactory {
  public constructor(private readonly authorMapper: AuthorMapper) {}

  public create(entityManager: EntityManager): AuthorRepository {
    return new AuthorRepositoryImpl(entityManager, this.authorMapper);
  }
}
