import { CategoryHttpController } from './api/httpControllers/categoryHttpController/categoryHttpController';
import { CreateCategoryCommandHandler } from './application/commandHandlers/createCategoryCommandHandler/createCategoryCommandHandler';
import { CreateCategoryCommandHandlerImpl } from './application/commandHandlers/createCategoryCommandHandler/createCategoryCommandHandlerImpl';
import { DeleteCategoryCommandHandler } from './application/commandHandlers/deleteCategoryCommandHandler/deleteCategoryCommandHandler';
import { DeleteCategoryCommandHandlerImpl } from './application/commandHandlers/deleteCategoryCommandHandler/deleteCategoryCommandHandlerImpl';
import { FindCategoriesQueryHandler } from './application/queryHandlers/findCategoriesQueryHandler/findCategoriesQueryHandler';
import { FindCategoriesQueryHandlerImpl } from './application/queryHandlers/findCategoriesQueryHandler/findCategoriesQueryHandlerImpl';
import { FindCategoryQueryHandler } from './application/queryHandlers/findCategoryQueryHandler/findCategoryQueryHandler';
import { FindCategoryQueryHandlerImpl } from './application/queryHandlers/findCategoryQueryHandler/findCategoryQueryHandlerImpl';
import { CategoryRepositoryFactory } from './application/repositories/categoryRepository/categoryRepositoryFactory';
import { CategoryMapper } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapper';
import { CategoryMapperImpl } from './infrastructure/repositories/categoryRepository/categoryMapper/categoryMapperImpl';
import { CategoryRepositoryFactoryImpl } from './infrastructure/repositories/categoryRepository/categoryRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class CategoryModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<CategoryMapper>(symbols.categoryMapper, CategoryMapperImpl);

    container.bindToConstructor<CategoryRepositoryFactory>(
      symbols.categoryRepositoryFactory,
      CategoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateCategoryCommandHandler>(
      symbols.createCategoryCommandHandler,
      CreateCategoryCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteCategoryCommandHandler>(
      symbols.deleteCategoryCommandHandler,
      DeleteCategoryCommandHandlerImpl,
    );

    container.bindToConstructor<FindCategoryQueryHandler>(
      symbols.findCategoryQueryHandler,
      FindCategoryQueryHandlerImpl,
    );

    container.bindToConstructor<FindCategoriesQueryHandler>(
      symbols.findCategoriesQueryHandler,
      FindCategoriesQueryHandlerImpl,
    );

    container.bindToConstructor<CategoryHttpController>(symbols.categoryHttpController, CategoryHttpController);
  }
}
