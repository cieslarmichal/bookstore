import 'reflect-metadata';

import { BookRepositoryFactory } from './application/repositories/bookRepository/bookRepositoryFactory';
import { BookService } from './application/services/bookService/bookService';
import { BookServiceImpl } from './application/services/bookService/bookServiceImpl';
import { BookModule } from './bookModule';
import { bookModuleSymbols } from './bookModuleSymbols';
import { BookController } from './infrastructure/httpControllers/bookController';
import { BookMapper } from './infrastructure/repositories/bookRepository/bookMapper/bookMapper';
import { BookMapperImpl } from './infrastructure/repositories/bookRepository/bookMapper/bookMapperImpl';
import { BookRepositoryFactoryImpl } from './infrastructure/repositories/bookRepository/bookRepositoryFactoryImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';

describe('BookModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [new PostgresModule(postgresModuleConfig), new LoggerModule(loggerModuleConfig), new BookModule()],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<BookMapper>(bookModuleSymbols.bookMapper)).toBeInstanceOf(BookMapperImpl);

    expect(container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory)).toBeInstanceOf(
      BookRepositoryFactoryImpl,
    );

    expect(container.get<BookService>(bookModuleSymbols.bookService)).toBeInstanceOf(BookServiceImpl);

    expect(container.get<BookController>(bookModuleSymbols.bookController)).toBeInstanceOf(BookController);
  });
});
