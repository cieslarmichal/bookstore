import { EntityManager } from 'typeorm';

import { BookRepository } from '../../repositories/bookRepository/bookRepository';

export interface BookRepositoryFactory {
  create(entityManager: EntityManager): BookRepository;
}
