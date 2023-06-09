import { EntityManager } from 'typeorm';

import { BookCategoryMapper } from './bookCategoryMapper/bookCategoryMapper';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { BookCategoryRepository } from '../../../application/repositories/bookCategoryRepository/bookCategoryRepository';
import { BookCategoryRepositoryFactory } from '../../../application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { symbols } from '../../../symbols';
import { BookCategoryRepositoryImpl } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryImpl';

@Injectable()
export class BookCategoryRepositoryFactoryImpl implements BookCategoryRepositoryFactory {
  public constructor(
    @Inject(symbols.bookCategoryMapper)
    private readonly bookCategoryMapper: BookCategoryMapper,
  ) {}

  public create(entityManager: EntityManager): BookCategoryRepository {
    return new BookCategoryRepositoryImpl(entityManager, this.bookCategoryMapper);
  }
}
