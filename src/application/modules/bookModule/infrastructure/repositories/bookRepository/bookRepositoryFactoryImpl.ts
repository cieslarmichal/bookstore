import { EntityManager } from 'typeorm';

import { BookMapper } from './bookMapper/bookMapper';
import { Injectable, Inject } from '../../../../../libs/dependencyInjection/decorators';
import { BookRepository } from '../../../application/repositories/bookRepository/bookRepository';
import { BookRepositoryFactory } from '../../../application/repositories/bookRepository/bookRepositoryFactory';
import { BookRepositoryImpl } from '../../../infrastructure/repositories/bookRepository/bookRepositoryImpl';
import { bookSymbols } from '../../../symbols';

@Injectable()
export class BookRepositoryFactoryImpl implements BookRepositoryFactory {
  public constructor(
    @Inject(bookSymbols.bookMapper)
    private readonly bookMapper: BookMapper,
  ) {}

  public create(entityManager: EntityManager): BookRepository {
    return new BookRepositoryImpl(entityManager, this.bookMapper);
  }
}
