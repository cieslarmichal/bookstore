import { EntityManager } from 'typeorm';
import { AuthorBookMapper } from '../mappers/authorBookMapper';
import { AuthorBookRepository } from './authorBookRepository';

export class AuthorBookRepositoryFactory {
  public constructor(private readonly authorBookMapper: AuthorBookMapper) {}

  public create(entityManager: EntityManager): AuthorBookRepository {
    return new AuthorBookRepository(entityManager, this.authorBookMapper);
  }
}
