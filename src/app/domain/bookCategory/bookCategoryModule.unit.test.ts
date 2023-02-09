import 'reflect-metadata';

import { BookCategoryModule } from './bookCategoryModule';
import { bookCategorySymbols } from './bookCategorySymbols';
import { BookCategoryService } from './contracts/services/bookCategoryService/bookCategoryService';
import { BookCategoryServiceImpl } from './implementations/services/bookCategoryService/bookCategoryServiceImpl';
import { DependencyInjectionContainer } from '../../libs/dependencyInjection/implementations/dependencyInjectionContainer';
import { DependencyInjectionContainerFactory } from '../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { BookModule } from '../book/bookModule';
import { CategoryModule } from '../category/categoryModule';

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
    expect.assertions(1);

    expect(container.get<BookCategoryService>(bookCategorySymbols.bookCategoryService)).toBeInstanceOf(
      BookCategoryServiceImpl,
    );
  });
});
