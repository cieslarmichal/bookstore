import { EntityManager } from 'typeorm';

import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { bookCategorySymbols } from '../../../bookCategorySymbols';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryMapper } from '../../../contracts/mappers/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryRepository } from '../../../contracts/repositories/bookCategoryRepository/bookCategoryRepository';
import { BookCategoryRepositoryImpl } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryImpl';

@Injectable()
export class BookCategoryRepositoryFactoryImpl implements BookCategoryRepositoryFactory {
  public constructor(
    @Inject(bookCategorySymbols.bookCategoryMapper)
    private readonly bookCategoryMapper: BookCategoryMapper,
  ) {}

  public create(entityManager: EntityManager): BookCategoryRepository {
    return new BookCategoryRepositoryImpl(entityManager, this.bookCategoryMapper);
  }
}
