import { EntityManager } from 'typeorm';
import { CategoryRepository } from '../../repositories/categoryRepository/categoryRepository';

export interface CategoryRepositoryFactory {
  create(entityManager: EntityManager): CategoryRepository;
}
