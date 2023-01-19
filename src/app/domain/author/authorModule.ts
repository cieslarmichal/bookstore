import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../common';
import { AUTHOR_MAPPER, AUTHOR_REPOSITORY_FACTORY, AUTHOR_SERVICE } from './authorInjectionSymbols';
import { AuthorMapper } from './mappers/authorMapper';
import { AuthorRepositoryFactory } from './repositories/authorRepositoryFactory';
import { AuthorService } from './services/authorService';

export class AuthorModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [AUTHOR_MAPPER]: asClass(AuthorMapper, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_REPOSITORY_FACTORY]: asClass(AuthorRepositoryFactory, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_SERVICE]: asClass(AuthorService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
