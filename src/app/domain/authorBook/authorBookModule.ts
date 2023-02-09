import { authorBookSymbols } from './authorBookSymbols';
import { AuthorBookRepositoryFactory } from './contracts/factories/authorBookRepositoryFactory/authorBookRepositoryFactory';
import { AuthorBookMapper } from './contracts/mappers/authorBookMapper/authorBookMapper';
import { AuthorBookService } from './contracts/services/authorBookService/authorBookService';
import { AuthorBookRepositoryFactoryImpl } from './implementations/factories/authorBookRepositoryFactory/authorBookRepositoryFactoryImpl';
import { AuthorBookMapperImpl } from './implementations/mappers/authorBookMapper/authorBookMapperImpl';
import { AuthorBookServiceImpl } from './implementations/services/authorBookService/authorBookServiceImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class AuthorBookModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<AuthorBookMapper>(authorBookSymbols.authorBookMapper, AuthorBookMapperImpl);

    container.bindToConstructor<AuthorBookRepositoryFactory>(
      authorBookSymbols.authorBookRepositoryFactory,
      AuthorBookRepositoryFactoryImpl,
    );

    container.bindToConstructor<AuthorBookService>(authorBookSymbols.authorBookService, AuthorBookServiceImpl);
  }
}
