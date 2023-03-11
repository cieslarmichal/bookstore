import { AuthorRepositoryFactory } from './application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorService } from './application/services/authorService/authorService';
import { AuthorServiceImpl } from './application/services/authorService/authorServiceImpl';
import { authorModuleSymbols } from './authorModuleSymbols';
import { AuthorController } from './infrastructure/httpControllers/authorController';
import { AuthorMapper } from './infrastructure/repositories/authorRepository/authorMapper/authorMapper';
import { AuthorMapperImpl } from './infrastructure/repositories/authorRepository/authorMapper/authorMapperImpl';
import { AuthorRepositoryFactoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryFactoryImpl';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/contracts/dependencyInjectionModule';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';

export class AuthorModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<AuthorMapper>(authorModuleSymbols.authorMapper, AuthorMapperImpl);

    container.bindToConstructor<AuthorRepositoryFactory>(
      authorModuleSymbols.authorRepositoryFactory,
      AuthorRepositoryFactoryImpl,
    );

    container.bindToConstructor<AuthorService>(authorModuleSymbols.authorService, AuthorServiceImpl);

    container.bindToConstructor<AuthorController>(authorModuleSymbols.authorController, AuthorController);
  }
}
