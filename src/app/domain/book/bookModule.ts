import { asClass, AwilixContainer } from 'awilix';
import { LoadableModule } from '../../shared';
import { BOOK_MAPPER, BOOK_REPOSITORY, BOOK_SERVICE } from './bookInjectionSymbols';
import { BookMapper } from './mappers/bookMapper';
import { BookRepository } from './repositories/bookRepository';
import { BookService } from './services/bookService';

export class BookModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [BOOK_MAPPER]: asClass(BookMapper),
      [BOOK_REPOSITORY]: asClass(BookRepository),
      [BOOK_SERVICE]: asClass(BookService),
    });
  }
}
