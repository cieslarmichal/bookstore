import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { AUTHOR_BOOK_MAPPER, AUTHOR_BOOK_REPOSITORY, AUTHOR_BOOK_SERVICE } from './authorBookInjectionSymbols';
import { AuthorBookMapper } from './mappers/authorBookMapper';
import { AuthorBookRepository } from './repositories/authorBookRepository';
import { AuthorBookService } from './services/authorBookService';

export class AuthorBookModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [AUTHOR_BOOK_MAPPER]: asClass(AuthorBookMapper, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_BOOK_REPOSITORY]: asClass(AuthorBookRepository, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_BOOK_SERVICE]: asClass(AuthorBookService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
