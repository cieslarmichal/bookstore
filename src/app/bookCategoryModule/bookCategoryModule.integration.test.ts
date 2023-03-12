import 'reflect-metadata';

import { BookCategoryRepositoryFactory } from './application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { BookCategoryService } from './application/services/bookCategoryService/bookCategoryService';
import { BookCategoryServiceImpl } from './application/services/bookCategoryService/bookCategoryServiceImpl';
import { BookCategoryModule } from './bookCategoryModule';
import { bookCategoryModuleSymbols } from './bookCategoryModuleSymbols';
import { BookCategoryController } from './infrastructure/httpControllers/bookCategoryController';
import { BookCategoryMapper } from './infrastructure/repositories/bookCategoryRepository/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryMapperImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryMapper/bookCategoryMapperImpl';
import { BookCategoryRepositoryFactoryImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryRepositoryFactoryImpl';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/dependencyInjectionContainerFactory';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { BookModule } from '../bookModule/bookModule';
import { CategoryModule } from '../domain/category/categoryModule';

describe('BookCategoryModule', () => {
  let container: DependencyInjectionContainer;

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();

  beforeAll(async () => {
    container = await DependencyInjectionContainerFactory.create({
      modules: [
        new PostgresModule(postgresModuleConfig),
        new LoggerModule(loggerModuleConfig),
        new BookModule(),
        new CategoryModule(),
        new BookCategoryModule(),
      ],
    });
  });

  it('declares bindings', async () => {
    expect(container.get<BookCategoryMapper>(bookCategoryModuleSymbols.bookCategoryMapper)).toBeInstanceOf(
      BookCategoryMapperImpl,
    );

    expect(
      container.get<BookCategoryRepositoryFactory>(bookCategoryModuleSymbols.bookCategoryRepositoryFactory),
    ).toBeInstanceOf(BookCategoryRepositoryFactoryImpl);

    expect(container.get<BookCategoryService>(bookCategoryModuleSymbols.bookCategoryService)).toBeInstanceOf(
      BookCategoryServiceImpl,
    );

    expect(container.get<BookCategoryController>(bookCategoryModuleSymbols.bookCategoryController)).toBeInstanceOf(
      BookCategoryController,
    );
  });
});
