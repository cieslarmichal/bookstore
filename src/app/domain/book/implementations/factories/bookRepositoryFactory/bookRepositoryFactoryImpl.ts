import { EntityManager } from 'typeorm';
import { BookRepositoryFactory } from '../../../contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookMapper } from '../../../contracts/mappers/bookMapper/bookMapper';
import { BookRepository } from '../../../contracts/repositories/bookRepository/bookRepository';
import { BookRepositoryImpl } from '../../repositories/bookRepository/bookRepositoryImpl';

export class BookRepositoryFactoryImpl implements BookRepositoryFactory {
  public constructor(private readonly bookMapper: BookMapper) {}

  public create(entityManager: EntityManager): BookRepository {
    return new BookRepositoryImpl(entityManager, this.bookMapper);
  }
}
