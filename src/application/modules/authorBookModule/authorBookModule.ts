import { AuthorBookRepositoryFactory } from './application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookService } from './application/services/authorBookService/authorBookService';
import { AuthorBookServiceImpl } from './application/services/authorBookService/authorBookServiceImpl';
import { authorBookModuleSymbols } from './authorBookModuleSymbols';
import { AuthorBookHttpController } from './infrastructure/httpControllers/authorBookHttpController/authorBookHttpController';
import { AuthorBookMapper } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapper';
import { AuthorBookMapperImpl } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapperImpl';
import { AuthorBookRepositoryFactoryImpl } from './infrastructure/repositories/authorBookRepository/authorBookRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class AuthorBookModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<AuthorBookMapper>(authorBookModuleSymbols.authorBookMapper, AuthorBookMapperImpl);

    container.bindToConstructor<AuthorBookRepositoryFactory>(
      authorBookModuleSymbols.authorBookRepositoryFactory,
      AuthorBookRepositoryFactoryImpl,
    );

    container.bindToConstructor<AuthorBookService>(authorBookModuleSymbols.authorBookService, AuthorBookServiceImpl);

    container.bindToConstructor<AuthorBookHttpController>(
      authorBookModuleSymbols.authorBookHttpController,
      AuthorBookHttpController,
    );
  }
}
