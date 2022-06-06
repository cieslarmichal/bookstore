import { EntityManager } from 'typeorm';
import { CategoryMapper } from '../mappers/categoryMapper';
import { CategoryRepository } from './categoryRepository';

export class CategoryRepositoryFactory {
  public constructor(private readonly categoryMapper: CategoryMapper) {}

  public create(entityManager: EntityManager): CategoryRepository {
    return new CategoryRepository(entityManager, this.categoryMapper);
  }
}
