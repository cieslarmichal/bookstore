import { CategoryRepositoryFactory } from './application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryService } from './application/services/categoryService/categoryService';
import { CategoryServiceImpl } from './application/services/categoryService/categoryServiceImpl';
import { categoryModuleSymbols } from './categoryModuleSymbols';
import { CategoryMapper } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapper';
import { CategoryMapperImpl } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapperImpl';
import { CategoryRepositoryFactoryImpl } from './infrastructure/repositories/categoryRepository/categoryRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class CategoryModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<CategoryMapper>(categoryModuleSymbols.categoryMapper, CategoryMapperImpl);

    container.bindToConstructor<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
      CategoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<CategoryService>(categoryModuleSymbols.categoryService, CategoryServiceImpl);
  }
}
