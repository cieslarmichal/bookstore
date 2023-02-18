import 'reflect-metadata';

import { BookCategoryModule } from './bookCategoryModule';
import { bookCategorySymbols } from './bookCategorySymbols';
import { BookCategoryRepositoryFactory } from './contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryMapper } from './contracts/mappers/bookCategoryMapper/bookCategoryMapper';
import { BookCategoryService } from './contracts/services/bookCategoryService/bookCategoryService';
import { BookCategoryRepositoryFactoryImpl } from './implementations/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactoryImpl';
import { BookCategoryMapperImpl } from './implementations/mappers/bookCategoryMapper/bookCategoryMapperImpl';
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
    expect.assertions(3);

    expect(container.get<BookCategoryMapper>(bookCategorySymbols.bookCategoryMapper)).toBeInstanceOf(
      BookCategoryMapperImpl,
    );

    expect(
      container.get<BookCategoryRepositoryFactory>(bookCategorySymbols.bookCategoryRepositoryFactory),
    ).toBeInstanceOf(BookCategoryRepositoryFactoryImpl);

    expect(container.get<BookCategoryService>(bookCategorySymbols.bookCategoryService)).toBeInstanceOf(
      BookCategoryServiceImpl,
    );
  });
});
