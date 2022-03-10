import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { CATEGORY_MAPPER, CATEGORY_REPOSITORY, CATEGORY_SERVICE } from './categoryInjectionSymbols';
import { CategoryMapper } from './mappers/categoryMapper';
import { CategoryRepository } from './repositories/categoryRepository';
import { CategoryService } from './services/categoryService';

export class CategoryModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [CATEGORY_MAPPER]: asClass(CategoryMapper, { lifetime: Lifetime.SINGLETON }),
      [CATEGORY_REPOSITORY]: asClass(CategoryRepository, { lifetime: Lifetime.SINGLETON }),
      [CATEGORY_SERVICE]: asClass(CategoryService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
