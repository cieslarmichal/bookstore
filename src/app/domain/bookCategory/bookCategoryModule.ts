import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../common';
import {
  BOOK_CATEGORY_MAPPER,
  BOOK_CATEGORY_REPOSITORY_FACTORY,
  BOOK_CATEGORY_SERVICE,
} from './bookCategoryInjectionSymbols';
import { BookCategoryMapper } from './mappers/bookCategoryMapper';
import { BookCategoryRepositoryFactory } from './repositories/bookCategoryRepositoryFactory';
import { BookCategoryService } from './services/bookCategoryService';

export class BookCategoryModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [BOOK_CATEGORY_MAPPER]: asClass(BookCategoryMapper, { lifetime: Lifetime.SINGLETON }),
      [BOOK_CATEGORY_REPOSITORY_FACTORY]: asClass(BookCategoryRepositoryFactory, { lifetime: Lifetime.SINGLETON }),
      [BOOK_CATEGORY_SERVICE]: asClass(BookCategoryService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
