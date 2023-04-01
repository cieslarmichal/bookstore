import { EntityManager } from 'typeorm';

import { BookMapper } from './bookMapper/bookMapper';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { BookRepository } from '../../../application/repositories/bookRepository/bookRepository';
import { BookRepositoryFactory } from '../../../application/repositories/bookRepository/bookRepositoryFactory';
import { bookModuleSymbols } from '../../../bookModuleSymbols';
import { BookRepositoryImpl } from '../../../infrastructure/repositories/bookRepository/bookRepositoryImpl';

@Injectable()
export class BookRepositoryFactoryImpl implements BookRepositoryFactory {
  public constructor(
    @Inject(bookModuleSymbols.bookMapper)
    private readonly bookMapper: BookMapper,
  ) {}

  public create(entityManager: EntityManager): BookRepository {
    return new BookRepositoryImpl(entityManager, this.bookMapper);
  }
}
