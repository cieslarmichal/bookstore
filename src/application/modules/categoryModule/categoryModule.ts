import { CategoryHttpController } from './api/httpControllers/categoryHttpController/categoryHttpController';
import { CategoryRepositoryFactory } from './application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryService } from './application/services/categoryService/categoryService';
import { CategoryServiceImpl } from './application/services/categoryService/categoryServiceImpl';
import { categoryModuleSymbols } from './categoryModuleSymbols';
import { CategoryMapper } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapper';
import { CategoryMapperImpl } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapperImpl';
import { CategoryRepositoryFactoryImpl } from './infrastructure/repositories/categoryRepository/categoryRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class CategoryModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<CategoryMapper>(categoryModuleSymbols.categoryMapper, CategoryMapperImpl);

    container.bindToConstructor<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
      CategoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<CategoryService>(categoryModuleSymbols.categoryService, CategoryServiceImpl);

    container.bindToConstructor<CategoryHttpController>(
      categoryModuleSymbols.categoryHttpController,
      CategoryHttpController,
    );
  }
}
