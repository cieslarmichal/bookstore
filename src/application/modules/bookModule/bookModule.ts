import { BookHttpController } from './api/httpControllers/bookHttpController/bookHttpController';
import { CreateBookCommandHandler } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandler';
import { CreateBookCommandHandlerImpl } from './application/commandHandlers/createBookCommandHandler/createBookCommandHandlerImpl';
import { DeleteBookCommandHandler } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandler';
import { DeleteBookCommandHandlerImpl } from './application/commandHandlers/deleteBookCommandHandler/deleteBookCommandHandlerImpl';
import { UpdateBookCommandHandler } from './application/commandHandlers/updateBookCommandHandler/updateBookCommandHandler';
import { UpdateBookCommandHandlerImpl } from './application/commandHandlers/updateBookCommandHandler/updateBookCommandHandlerImpl';
import { FindBookQueryHandler } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandler';
import { FindBookQueryHandlerImpl } from './application/queryHandlers/findBookQueryHandler/findBookQueryHandlerImpl';
import { FindBooksQueryHandler } from './application/queryHandlers/findBooksQueryHandler/findBooksQueryHandler';
import { FindBooksQueryHandlerImpl } from './application/queryHandlers/findBooksQueryHandler/findBooksQueryHandlerImpl';
import { BookRepositoryFactory } from './application/repositories/bookRepository/bookRepositoryFactory';
import { BookMapper } from './infrastructure/repositories/bookRepository/bookMapper/bookMapper';
import { BookMapperImpl } from './infrastructure/repositories/bookRepository/bookMapper/bookMapperImpl';
import { BookRepositoryFactoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class BookModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<BookMapper>(symbols.bookMapper, BookMapperImpl);

    container.bindToConstructor<BookRepositoryFactory>(symbols.bookRepositoryFactory, BookRepositoryFactoryImpl);

    container.bindToConstructor<CreateBookCommandHandler>(
      symbols.createBookCommandHandler,
      CreateBookCommandHandlerImpl,
    );

    container.bindToConstructor<UpdateBookCommandHandler>(
      symbols.updateBookCommandHandler,
      UpdateBookCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteBookCommandHandler>(
      symbols.deleteBookCommandHandler,
      DeleteBookCommandHandlerImpl,
    );

    container.bindToConstructor<FindBookQueryHandler>(symbols.findBookQueryHandler, FindBookQueryHandlerImpl);

    container.bindToConstructor<FindBooksQueryHandler>(symbols.findBooksQueryHandler, FindBooksQueryHandlerImpl);

    container.bindToConstructor<BookHttpController>(symbols.bookHttpController, BookHttpController);
  }
}
