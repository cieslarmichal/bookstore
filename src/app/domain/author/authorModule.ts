import { asClass, AwilixContainer, Lifetime } from 'awilix';

import { authorSymbols } from './authorSymbols';
import { AuthorRepositoryFactoryImpl } from './implementations/factories/authorRepositoryFactory/authorRepositoryFactoryImpl';
import { AuthorMapperImpl } from './implementations/mappers/authorMapper/authorMapperImpl';
import { AuthorServiceImpl } from './implementations/services/authorService/authorServiceImpl';
import { LoadableModule } from '../../libs/dependencyInjection/loadableModule';

export class AuthorModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [authorSymbols.authorMapper]: asClass(AuthorMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [authorSymbols.authorRepositoryFactory]: asClass(AuthorRepositoryFactoryImpl, { lifetime: Lifetime.SINGLETON }),
      [authorSymbols.authorService]: asClass(AuthorServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
