import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { BOOK_CATEGORY_MAPPER, BOOK_CATEGORY_REPOSITORY, BOOK_CATEGORY_SERVICE } from './bookCategoryInjectionSymbols';
import { BookCategoryMapper } from './mappers/bookCategoryMapper';
import { BookCategoryRepository } from './repositories/bookCategoryRepository';
import { BookCategoryService } from './services/bookCategoryService';

export class BookCategoryModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [BOOK_CATEGORY_MAPPER]: asClass(BookCategoryMapper, { lifetime: Lifetime.SINGLETON }),
      [BOOK_CATEGORY_REPOSITORY]: asClass(BookCategoryRepository, { lifetime: Lifetime.SINGLETON }),
      [BOOK_CATEGORY_SERVICE]: asClass(BookCategoryService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
