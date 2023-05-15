import 'reflect-metadata';

import { BookCategoryHttpController } from './api/httpControllers/bookCategoryHttpController/bookCategoryHttpController';
import { BookCategoryRepositoryFactory } from './application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { BookCategoryModule } from './bookCategoryModule';
import { BookCategoryRepositoryFactoryImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryRepositoryFactoryImpl';
import { bookCategorySymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { BookModule } from '../bookModule/bookModule';
import { CategoryModule } from '../categoryModule/categoryModule';

describe('BookCategoryModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new BookCategoryModule(),
        new BookModule(),
        new CategoryModule(),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(
      container.get<BookCategoryRepositoryFactory>(bookCategorySymbols.bookCategoryRepositoryFactory),
    ).toBeInstanceOf(BookCategoryRepositoryFactoryImpl);

    expect(container.get<BookCategoryHttpController>(bookCategorySymbols.bookCategoryHttpController)).toBeInstanceOf(
      BookCategoryHttpController,
    );
  });
});
