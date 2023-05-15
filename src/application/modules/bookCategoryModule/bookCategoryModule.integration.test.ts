import 'reflect-metadata';

import { BookCategoryHttpController } from './api/httpControllers/bookCategoryHttpController/bookCategoryHttpController';
import { BookCategoryRepositoryFactory } from './application/repositories/bookCategoryRepository/bookCategoryRepositoryFactory';
import { BookCategoryRepositoryFactoryImpl } from './infrastructure/repositories/bookCategoryRepository/bookCategoryRepositoryFactoryImpl';
import { bookCategorySymbols } from './symbols';
import { DependencyInjectionContainer } from '../../../libs/dependencyInjection/dependencyInjectionContainer';
import { Application } from '../../application';

describe('BookCategoryModule', () => {
  let container: DependencyInjectionContainer;

  beforeAll(async () => {
    container = Application.createContainer();
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
