import { EntityManager } from 'typeorm';

import { BookCategoryRepository } from '../../../application/repositories/bookCategoryRepository/bookCategoryRepository';

export interface BookCategoryRepositoryFactory {
  create(entityManager: EntityManager): BookCategoryRepository;
}
