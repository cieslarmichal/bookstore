import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../libs/dependencyInjection/contracts/decorators';
import { bookSymbols } from '../../../bookSymbols';
import { BookRepositoryFactory } from '../../../contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';
import { BookRepository } from '../../../contracts/repositories/bookRepository/bookRepository';
import { BookRepositoryImpl } from '../../repositories/bookRepository/bookRepositoryImpl';

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
