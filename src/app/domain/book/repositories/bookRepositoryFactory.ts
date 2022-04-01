import { EntityManager } from 'typeorm';
import { BookMapper } from '../mappers/bookMapper';
import { BookRepository } from './bookRepository';

export class BookRepositoryFactory {
  public constructor(private readonly bookMapper: BookMapper) {}

  public create(entityManager: EntityManager): BookRepository {
    return new BookRepository(entityManager, this.bookMapper);
  }
}
