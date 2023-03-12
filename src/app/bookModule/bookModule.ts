import { BookRepositoryFactory } from './application/repositories/bookRepository/bookRepositoryFactory';
import { BookService } from './application/services/bookService/bookService';
import { BookServiceImpl } from './application/services/bookService/bookServiceImpl';
import { bookModuleSymbols } from './bookModuleSymbols';
import { BookController } from './infrastructure/httpControllers/bookController';
import { BookMapper } from './infrastructure/repositories/bookRepository/bookMapper/bookMapper';
import { BookMapperImpl } from './infrastructure/repositories/bookRepository/bookMapper/bookMapperImpl';
import { BookRepositoryFactoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionModule } from '../../libs/dependencyInjection/dependencyInjectionModule';

export class BookModule implements DependencyInjectionModule {
  public async declareBindings(container: DependencyInjectionContainer): Promise<void> {
    container.bindToConstructor<BookMapper>(bookModuleSymbols.bookMapper, BookMapperImpl);

    container.bindToConstructor<BookRepositoryFactory>(
      bookModuleSymbols.bookRepositoryFactory,
      BookRepositoryFactoryImpl,
    );

    container.bindToConstructor<BookService>(bookModuleSymbols.bookService, BookServiceImpl);

    container.bindToConstructor<BookController>(bookModuleSymbols.bookController, BookController);
  }
}
