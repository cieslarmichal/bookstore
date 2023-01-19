import { EntityManager } from 'typeorm';
import { CategoryRepositoryFactory } from '../../../contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';
import { CategoryRepository } from '../../../contracts/repositories/categoryRepository/categoryRepository';
import { CategoryRepositoryImpl } from '../../repositories/categoryRepository/categoryRepositoryImpl';

export class CategoryRepositoryFactoryImpl implements CategoryRepositoryFactory {
  public constructor(private readonly categoryMapper: CategoryMapper) {}

  public create(entityManager: EntityManager): CategoryRepository {
    return new CategoryRepositoryImpl(entityManager, this.categoryMapper);
  }
}
