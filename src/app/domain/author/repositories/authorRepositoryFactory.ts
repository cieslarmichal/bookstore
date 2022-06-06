import { EntityManager } from 'typeorm';
import { AuthorMapper } from '../mappers/authorMapper';
import { AuthorRepository } from './authorRepository';

export class AuthorRepositoryFactory {
  public constructor(private readonly authorMapper: AuthorMapper) {}

  public create(entityManager: EntityManager): AuthorRepository {
    return new AuthorRepository(entityManager, this.authorMapper);
  }
}
