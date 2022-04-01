import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { AUTHOR_BOOK_MAPPER, AUTHOR_BOOK_REPOSITORY_FACTORY, AUTHOR_BOOK_SERVICE } from './authorBookInjectionSymbols';
import { AuthorBookMapper } from './mappers/authorBookMapper';
import { AuthorBookRepositoryFactory } from './repositories/authorBookRepositoryFactory';
import { AuthorBookService } from './services/authorBookService';

export class AuthorBookModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [AUTHOR_BOOK_MAPPER]: asClass(AuthorBookMapper, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_BOOK_REPOSITORY_FACTORY]: asClass(AuthorBookRepositoryFactory, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_BOOK_SERVICE]: asClass(AuthorBookService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
