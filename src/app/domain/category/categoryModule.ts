import { categorySymbols } from './categorySymbols';
import { CategoryRepositoryFactory } from './contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryMapper } from './contracts/mappers/categoryMapper/categoryMapper';
import { CategoryService } from './contracts/services/categoryService/categoryService';
import { CategoryRepositoryFactoryImpl } from './implementations/factories/categoryRepositoryFactory/categoryRepositoryFactoryImpl';
import { CategoryMapperImpl } from './implementations/mappers/categoryMapper/categoryMapperImpl';
import { CategoryServiceImpl } from './implementations/services/categoryService/categoryServiceImpl';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class CategoryModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<CategoryMapper>(categorySymbols.categoryMapper, CategoryMapperImpl);

    container.bindToConstructor<CategoryRepositoryFactory>(
      categorySymbols.categoryRepositoryFactory,
      CategoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<CategoryService>(categorySymbols.categoryService, CategoryServiceImpl);
  }
}
