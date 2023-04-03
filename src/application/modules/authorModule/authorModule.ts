import { AuthorRepositoryFactory } from './application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorService } from './application/services/authorService/authorService';
import { AuthorServiceImpl } from './application/services/authorService/authorServiceImpl';
import { authorModuleSymbols } from './authorModuleSymbols';
import { AuthorHttpController } from './infrastructure/httpControllers/authorHttpController/addressHttpController';
import { AuthorMapper } from './infrastructure/repositories/authorRepository/authorMapper/authorMapper';
import { AuthorMapperImpl } from './infrastructure/repositories/authorRepository/authorMapper/authorMapperImpl';
import { AuthorRepositoryFactoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class AuthorModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<AuthorMapper>(authorModuleSymbols.authorMapper, AuthorMapperImpl);

    container.bindToConstructor<AuthorRepositoryFactory>(
      authorModuleSymbols.authorRepositoryFactory,
      AuthorRepositoryFactoryImpl,
    );

    container.bindToConstructor<AuthorService>(authorModuleSymbols.authorService, AuthorServiceImpl);

    container.bindToConstructor<AuthorHttpController>(authorModuleSymbols.authorHttpController, AuthorHttpController);
  }
}
