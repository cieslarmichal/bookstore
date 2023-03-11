import { EntityManager } from 'typeorm';

import { Inject, Injectable } from '../../../../../../libs/dependencyInjection/contracts/decorators';
import { categorySymbols } from '../../../categorySymbols';
import { CategoryRepositoryFactory } from '../../../contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryMapper } from '../../../contracts/mappers/categoryMapper/categoryMapper';
import { CategoryRepository } from '../../../contracts/repositories/categoryRepository/categoryRepository';
import { CategoryRepositoryImpl } from '../../repositories/categoryRepository/categoryRepositoryImpl';

@Injectable()
export class CategoryRepositoryFactoryImpl implements CategoryRepositoryFactory {
  public constructor(
    @Inject(categorySymbols.categoryMapper)
    private readonly categoryMapper: CategoryMapper,
  ) {}

  public create(entityManager: EntityManager): CategoryRepository {
    return new CategoryRepositoryImpl(entityManager, this.categoryMapper);
  }
}
