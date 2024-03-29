import { EntityManager } from 'typeorm';

import { CategoryMapper } from './categoryMapper/categoryMapper';
import { CategoryRepositoryImpl } from './categoryRepositoryImpl';
import { Injectable, Inject } from '../../../../../../libs/dependencyInjection/decorators';
import { CategoryRepository } from '../../../application/repositories/categoryRepository/categoryRepository';
import { CategoryRepositoryFactory } from '../../../application/repositories/categoryRepository/categoryRepositoryFactory';
import { symbols } from '../../../symbols';

@Injectable()
export class CategoryRepositoryFactoryImpl implements CategoryRepositoryFactory {
  public constructor(
    @Inject(symbols.categoryMapper)
    private readonly categoryMapper: CategoryMapper,
  ) {}

  public create(entityManager: EntityManager): CategoryRepository {
    return new CategoryRepositoryImpl(entityManager, this.categoryMapper);
  }
}
