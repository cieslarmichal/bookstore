import { asClass, AwilixContainer } from 'awilix';
import { LoadableModule } from '../../shared';
import { AUTHOR_MAPPER, AUTHOR_REPOSITORY, AUTHOR_SERVICE } from './authorInjectionSymbols';
import { AuthorMapper } from './mappers/authorMapper';
import { AuthorRepository } from './repositories/authorRepository';
import { AuthorService } from './services/authorService';

export class BookModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [AUTHOR_MAPPER]: asClass(AuthorMapper),
      [AUTHOR_REPOSITORY]: asClass(AuthorRepository),
      [AUTHOR_SERVICE]: asClass(AuthorService),
    });
  }
}
