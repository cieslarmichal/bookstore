import { EntityManager } from 'typeorm';

import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryRepository } from '../../../contracts/repositories/bookCategoryRepository/bookCategoryRepository';
import { BookCategoryRepositoryImpl } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryImpl';

export class BookCategoryRepositoryFactoryImpl implements BookCategoryRepositoryFactory {
  public constructor(private readonly bookCategoryMapper: BookCategoryMapper) {}

  public create(entityManager: EntityManager): BookCategoryRepository {
    return new BookCategoryRepositoryImpl(entityManager, this.bookCategoryMapper);
  }
}
