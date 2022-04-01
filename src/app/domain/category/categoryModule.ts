import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { CATEGORY_MAPPER, CATEGORY_REPOSITORY_FACTORY, CATEGORY_SERVICE } from './categoryInjectionSymbols';
import { CategoryMapper } from './mappers/categoryMapper';
import { CategoryRepositoryFactory } from './repositories/categoryRepositoryFactory';
import { CategoryService } from './services/categoryService';

export class CategoryModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [CATEGORY_MAPPER]: asClass(CategoryMapper, { lifetime: Lifetime.SINGLETON }),
      [CATEGORY_REPOSITORY_FACTORY]: asClass(CategoryRepositoryFactory, { lifetime: Lifetime.SINGLETON }),
      [CATEGORY_SERVICE]: asClass(CategoryService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
