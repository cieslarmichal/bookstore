import { BookCategoryHttpController } from './api/httpControllers/bookCategoryHttpController/bookCategoryHttpController';
import { CreateBookCategoryCommandHandler } from './application/commandHandlers/createBookCategoryCommandHandler/createBookCategoryCommandHandler';
import { CreateBookCategoryCommandHandlerImpl } from './application/commandHandlers/createBookCategoryCommandHandler/createBookCategoryCommandHandlerImpl';
import { DeleteBookCategoryCommandHandler } from './application/commandHandlers/deleteBookCategoryCommandHandler/deleteBookCategoryCommandHandler';
import { DeleteBookCategoryCommandHandlerImpl } from './application/commandHandlers/deleteBookCategoryCommandHandler/deleteBookCategoryCommandHandlerImpl';
import { BookCategoryRepositoryFactory } from './application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { BookCategoryMapper } from './infrastructure/repositories/bookCategoryRepository/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryMapperImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryMapper/bookCategoryMapperImpl';
import { BookCategoryRepositoryFactoryImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryRepositoryFactoryImpl';
import { symbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../../libs/dependencyInjection/dependencyInjectionModule';

export class BookCategoryModule implements DependencyInjectionModule {
  public declareBindings(container: DependencyInjectionContainer): void {
    container.bindToConstructor<BookCategoryMapper>(symbols.bookCategoryMapper, BookCategoryMapperImpl);

    container.bindToConstructor<BookCategoryRepositoryFactory>(
      symbols.bookCategoryRepositoryFactory,
      BookCategoryRepositoryFactoryImpl,
    );

    container.bindToConstructor<CreateBookCategoryCommandHandler>(
      symbols.createBookCategoryCommandHandler,
      CreateBookCategoryCommandHandlerImpl,
    );

    container.bindToConstructor<DeleteBookCategoryCommandHandler>(
      symbols.deleteBookCategoryCommandHandler,
      DeleteBookCategoryCommandHandlerImpl,
    );

    container.bindToConstructor<BookCategoryHttpController>(
      symbols.bookCategoryHttpController,
      BookCategoryHttpController,
    );
  }
}
