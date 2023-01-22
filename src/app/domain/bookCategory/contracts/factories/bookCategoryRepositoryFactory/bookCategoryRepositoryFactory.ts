import { EntityManager } from 'typeorm';

import { BookCategoryRepository } from '../../repositories/bookCategoryRepository/bookCategoryRepository';

export interface BookCategoryRepositoryFactory {
  create(entityManager: EntityManager): BookCategoryRepository;
}
