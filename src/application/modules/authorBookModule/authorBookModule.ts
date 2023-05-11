import { AuthorBookHttpController } from './api/httpControllers/authorBookHttpController/authorBookHttpController';
import { CreateAuthorBookCommandHandler } from './application/commandHandlers/createAuthorBookCommandHandler/createAuthorBookCommandHandler';
import { CreateAuthorBookCommandHandlerImpl } from './application/commandHandlers/createAuthorBookCommandHandler/createAuthorBookCommandHandlerImpl';
import { DeleteAuthorBookCommandHandler } from './application/commandHandlers/deleteAuthorBookCommandHandler/deleteAuthorBookCommandHandler';
import { DeleteAuthorBookCommandHandlerImpl } from './application/commandHandlers/deleteAuthorBookCommandHandler/deleteAuthorBookCommandHandlerImpl';
import { AuthorBookRepositoryFactory } from './application/repositories/authorBookRepository/authorBookRepositoryFactory';
import { AuthorBookMapper } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapper';
import { AuthorBookMapperImpl } from './infrastructure/repositories/authorBookRepository/authorBookMapper/authorBookMapperImpl';
import { AuthorBookRepositoryFactoryImpl } from './infrastructure/repositories/authorBookRepository/authorBookRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class AuthorBookModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<AuthorBookMapper>(symbols.authorBookMapper, AuthorBookMapperImpl);

    container.bindToConstructor<AuthorBookRepositoryFactory>(
      symbols.authorBookRepositoryFactory,
      AuthorBookRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateAuthorBookCommandHandler>(
      symbols.createAuthorBookCommandHandler,
      CreateAuthorBookCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteAuthorBookCommandHandler>(
      symbols.deleteAuthorBookCommandHandler,
      DeleteAuthorBookCommandHandlerImpl,
    );

    container.bindToConstructor<AuthorBookHttpController>(symbols.authorBookHttpController, AuthorBookHttpController);
  }
}
