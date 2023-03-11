import { AuthorBookRepositoryFactory } from './application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookService } from './application/services/authorBookService/authorBookService';
import { AuthorBookServiceImpl } from './application/services/authorBookService/authorBookServiceImpl';
import { authorBookModuleSymbols } from './authorBookModuleSymbols';
import { AuthorBookMapper } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapper';
import { AuthorBookMapperImpl } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapperImpl';
import { AuthorBookRepositoryFactoryImpl } from './infrastructure/repositories/authorBookRepository/authorBookRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class AuthorBookModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<AuthorBookMapper>(authorBookModuleSymbols.authorBookMapper, AuthorBookMapperImpl);

    container.bindToConstructor<AuthorBookRepositoryFactory>(
      authorBookModuleSymbols.authorBookRepositoryFactory,
      AuthorBookRepositoryFactoryImpl,
    );

    container.bindToConstructor<AuthorBookService>(authorBookModuleSymbols.authorBookService, AuthorBookServiceImpl);
  }
}
