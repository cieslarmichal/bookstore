import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../libs/di/loadableModule';
import { authorSymbols } from './authorSymbols';
import { AuthorRepositoryFactoryImpl } from './implementations/factories/authorRepositoryFactory/authorRepositoryFactoryImpl';
import { AuthorMapperImpl } from './implementations/mappers/authorMapper/authorMapperImpl';
import { AuthorServiceImpl } from './implementations/services/authorService/authorServiceImpl';

export class AuthorModule extends LoadableModule {
  public override async loadDependenciesIntoDIContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [authorSymbols.authorMapper]: asClass(AuthorMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [authorSymbols.authorRepositoryFactory]: asClass(AuthorRepositoryFactoryImpl, { lifetime: Lifetime.SINGLETON }),
      [authorSymbols.authorService]: asClass(AuthorServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
