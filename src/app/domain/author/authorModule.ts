import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../shared';
import { AUTHOR_MAPPER, AUTHOR_REPOSITORY, AUTHOR_SERVICE } from './authorInjectionSymbols';
import { AuthorMapper } from './mappers/authorMapper';
import { AuthorRepository } from './repositories/authorRepository';
import { AuthorService } from './services/authorService';

export class AuthorModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [AUTHOR_MAPPER]: asClass(AuthorMapper, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_REPOSITORY]: asClass(AuthorRepository, { lifetime: Lifetime.SINGLETON }),
      [AUTHOR_SERVICE]: asClass(AuthorService, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
