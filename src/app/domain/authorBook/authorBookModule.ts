import { asClass, AwilixContainer, Lifetime } from 'awilix';
import { LoadableModule } from '../../libs/dependencyInjection/loadableModule';
import { authorBookSymbols } from './authorBookSymbols';
import { AuthorBookRepositoryFactoryImpl } from './implementations/factories/authorBookRepositoryFactory/authorBookRepositoryFactoryImpl';
import { AuthorBookMapperImpl } from './implementations/mappers/authorBookMapper/authorBookMapperImpl';
import { AuthorBookServiceImpl } from './implementations/services/authorBookService/authorBookServiceImpl';

export class AuthorBookModule extends LoadableModule {
  public override async loadDependenciesIntoContainer(container: AwilixContainer): Promise<void> {
    container.register({
      [authorBookSymbols.authorBookMapper]: asClass(AuthorBookMapperImpl, { lifetime: Lifetime.SINGLETON }),
      [authorBookSymbols.authorBookRepositoryFactory]: asClass(AuthorBookRepositoryFactoryImpl, {
        lifetime: Lifetime.SINGLETON,
      }),
      [authorBookSymbols.authorBookService]: asClass(AuthorBookServiceImpl, { lifetime: Lifetime.SINGLETON }),
    });
  }
}
