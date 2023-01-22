import { AwilixContainer, asClass, Lifetime } from 'awilix';

import { categorySymbols } from './categorySymbols';
import { CategoryRepositoryFactoryImpl } from './implementations/factories/categoryRepositoryFactory/categoryRepositoryFactoryImpl';
import { CategoryMapperImpl } from './implementations/mappers/categoryMapper/categoryMapperImpl';
import { CategoryServiceImpl } from './implementations/services/categoryService/categoryServiceImpl';
import { Module } from '../../libs/dependencyInjection/module';

export class CategoryModule implements Module {
  public async registerSymbols(container: AwilixContainer): Promise<void> {
    container.register({
      [categorySymbols.categoryMapper]: asClass(CategoryMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [categorySymbols.categoryRepositoryFactory]: asClass(CategoryRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [categorySymbols.categoryService]: asClass(CategoryServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
