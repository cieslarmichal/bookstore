import { EntityManager } from 'typeorm';
import { BookCategoryMapper } from '../mappers/bookCategoryMapper';
import { BookCategoryRepository } from './bookCategoryRepository';

export class BookCategoryRepositoryFactory {
  public constructor(private readonly bookCategoryMapper: BookCategoryMapper) {}

  public create(entityManager: EntityManager): BookCategoryRepository {
    return new BookCategoryRepository(entityManager, this.bookCategoryMapper);
  }
}
