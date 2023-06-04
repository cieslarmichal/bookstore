import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { CreateBookCategoryCommandHandler } from './createBookCategoryCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookSymbols } from '../../../../bookModule/symbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryRepositoryFactory } from '../../../../categoryModule/application/repositories/categoryRepository/categoryRepositoryFactory';
import { categorySymbols } from '../../../../categoryModule/symbols';
import { CategoryEntityTestFactory } from '../../../../categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { BookCategoryAlreadyExistsError } from '../../errors/bookCategoryAlreadyExistsError';
import { symbols } from '../../../symbols';
import { BookCategoryRepositoryFactory } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryFactory';

describe('CreateBookCategoryCommandHandler', () => {
  let createBookCategoryCommandHandler: CreateBookCategoryCommandHandler;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    createBookCategoryCommandHandler = container.get<CreateBookCategoryCommandHandler>(
      symbols.createBookCategoryCommandHandler,
    );
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(symbols.bookCategoryRepositoryFactory);
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(categorySymbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('creates bookCategory in database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const categoryRepository = categoryRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

      const categoryEntity = categoryEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const category = await categoryRepository.createCategory(categoryEntity);

      const book = await bookRepository.createBook({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      const { bookCategory } = await createBookCategoryCommandHandler.execute({
        unitOfWork,
        draft: {
          categoryId: category.id,
          bookId: book.id,
        },
      });

      const foundBookCategory = await bookCategoryRepository.findBookCategory({ id: bookCategory.id });

      expect(foundBookCategory).not.toBeNull();
    });
  });

  it('should not create bookCategory and throw if bookCategory with the same bookId and categoryId exists', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const categoryRepository = categoryRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const categoryEntity = categoryEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const category = await categoryRepository.createCategory(categoryEntity);

      const book = await bookRepository.createBook({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      await createBookCategoryCommandHandler.execute({
        unitOfWork,
        draft: {
          categoryId: category.id,
          bookId: book.id,
        },
      });

      try {
        await createBookCategoryCommandHandler.execute({
          unitOfWork,
          draft: {
            categoryId: category.id,
            bookId: book.id,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BookCategoryAlreadyExistsError);
      }
    });
  });
});
