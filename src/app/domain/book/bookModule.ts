import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { BOOK_MAPPER, BOOK_REPOSITORY_FACTORY, BOOK_SERVICE } from './bookInjectionSymbols';
import { BookMapper } from './mappers/bookMapper';
import { BookRepositoryFactory } from './repositories/bookRepositoryFactory';
import { BookService } from './services/bookService';

export class BookModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [BOOK_MAPPER]: asClass(BookMapper, { lifetime: Lifetime.SINGLETON }),
      [BOOK_REPOSITORY_FACTORY]: asClass(BookRepositoryFactory, { lifetime: Lifetime.SINGLETON }),
      [BOOK_SERVICE]: asClass(BookService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
