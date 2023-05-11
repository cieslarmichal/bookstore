import { AuthorHttpController } from './api/httpControllers/authorHttpController/authorHttpController';
import { CreateAuthorCommandHandler } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandler';
import { CreateAuthorCommandHandlerImpl } from './application/commandHandlers/createAuthorCommandHandler/createAuthorCommandHandlerImpl';
import { DeleteAuthorCommandHandler } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandler';
import { DeleteAuthorCommandHandlerImpl } from './application/commandHandlers/deleteAuthorCommandHandler/deleteAuthorCommandHandlerImpl';
import { UpdateAuthorCommandHandler } from './application/commandHandlers/updateAuthorCommandHandler/updateAuthorCommandHandler';
import { UpdateAuthorCommandHandlerImpl } from './application/commandHandlers/updateAuthorCommandHandler/updateAuthorCommandHandlerImpl';
import { FindAuthorQueryHandler } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandler';
import { FindAuthorQueryHandlerImpl } from './application/queryHandlers/findAuthorQueryHandler/findAuthorQueryHandlerImpl';
import { FindAuthorsByBookIdQueryHandler } from './application/queryHandlers/findAuthorsByBookIdQueryHandler/findAuthorsByBookIdQueryHandler';
import { FindAuthorsByBookIdQueryHandlerImpl } from './application/queryHandlers/findAuthorsByBookIdQueryHandler/findAuthorsByBookIdQueryHandlerImpl';
import { FindAuthorsQueryHandler } from './application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandler';
import { FindAuthorsQueryHandlerImpl } from './application/queryHandlers/findAuthorsQueryHandler/findAuthorsQueryHandlerImpl';
import { AuthorRepositoryFactory } from './application/repositories/authorRepository/authorRepositoryFactory';
import { AuthorMapper } from './infrastructure/repositories/authorRepository/authorMapper/authorMapper';
import { AuthorMapperImpl } from './infrastructure/repositories/authorRepository/authorMapper/authorMapperImpl';
import { AuthorRepositoryFactoryImpl } from './infrastructure/repositories/authorRepository/authorRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class AuthorModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<AuthorMapper>(symbols.authorMapper, AuthorMapperImpl);

    container.bindToConstructor<AuthorRepositoryFactory>(symbols.authorRepositoryFactory, AuthorRepositoryFactoryImpl);

    container.bindToConstructor<CreateAuthorCommandHandler>(
      symbols.createAuthorCommandHandler,
      CreateAuthorCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteAuthorCommandHandler>(
      symbols.deleteAuthorCommandHandler,
      DeleteAuthorCommandHandlerImpl,
    );

    container.bindToConstructor<UpdateAuthorCommandHandler>(
      symbols.updateAuthorCommandHandler,
      UpdateAuthorCommandHandlerImpl,
    );

    container.bindToConstructor<FindAuthorQueryHandler>(symbols.findAuthorQueryHandler, FindAuthorQueryHandlerImpl);

    container.bindToConstructor<FindAuthorsQueryHandler>(symbols.findAuthorsQueryHandler, FindAuthorsQueryHandlerImpl);

    container.bindToConstructor<FindAuthorsByBookIdQueryHandler>(
      symbols.findAuthorsByBookIdQueryHandler,
      FindAuthorsByBookIdQueryHandlerImpl,
    );

    container.bindToConstructor<AuthorHttpController>(symbols.authorHttpController, AuthorHttpController);
  }
}
