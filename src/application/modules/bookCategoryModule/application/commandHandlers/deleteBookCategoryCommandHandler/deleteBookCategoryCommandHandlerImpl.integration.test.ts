import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { DeleteBookCategoryCommandHandler } from './deleteBookCategoryCommandHandler';
import { TestTransactionInternalRunner } from '../../../../../../common/tests/testTransactionInternalRunner';
import { postgresModuleSymbols } from '../../../../../../libs/postgres/postgresModuleSymbols';
import { Application } from '../../../../../application';
import { BookRepositoryFactory } from '../../../../bookModule/application/repositories/bookRepository/bookRepositoryFactory';
import { bookModuleSymbols } from '../../../../bookModule/bookModuleSymbols';
import { BookEntityTestFactory } from '../../../../bookModule/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryRepositoryFactory } from '../../../../categoryModule/application/repositories/categoryRepository/categoryRepositoryFactory';
import { categoryModuleSymbols } from '../../../../categoryModule/categoryModuleSymbols';
import { CategoryEntityTestFactory } from '../../../../categoryModule/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { BookCategoryNotFoundError } from '../../../infrastructure/errors/bookCategoryNotFoundError';
import { symbols } from '../../../symbols';
import { BookCategoryEntityTestFactory } from '../../../tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { BookCategoryRepositoryFactory } from '../../repositories/bookCategoryRepository/bookCategoryRepositoryFactory';

describe('DeleteBookCategoryCommandHandler', () => {
  let deleteBookCategoryCommandHandler: DeleteBookCategoryCommandHandler;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let dataSource: DataSource;

  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  beforeAll(async () => {
    const container = Application.createContainer();

    deleteBookCategoryCommandHandler = container.get<DeleteBookCategoryCommandHandler>(
      symbols.deleteBookCategoryCommandHandler,
    );
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(symbols.bookCategoryRepositoryFactory);
    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(
      categoryModuleSymbols.categoryRepositoryFactory,
    );
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookModuleSymbols.bookRepositoryFactory);
    dataSource = container.get<DataSource>(postgresModuleSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('deletes bookCategory from database', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const entityManager = unitOfWork.getEntityManager();

      const categoryRepository = categoryRepositoryFactory.create(entityManager);

      const bookRepository = bookRepositoryFactory.create(entityManager);

      const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

      const categoryEntity = categoryEntityTestFactory.create();

      const bookEntity = bookEntityTestFactory.create();

      const { id: bookCategoryId } = bookCategoryEntityTestFactory.create();

      const category = await categoryRepository.createOne(categoryEntity);

      const book = await bookRepository.createOne({
        id: bookEntity.id,
        format: bookEntity.format,
        language: bookEntity.language,
        price: bookEntity.price,
        title: bookEntity.title,
        isbn: bookEntity.isbn,
        releaseYear: bookEntity.releaseYear,
      });

      const bookCategory = await bookCategoryRepository.createBookCategory({
        id: bookCategoryId,
        categoryId: category.id,
        bookId: book.id,
      });

      await deleteBookCategoryCommandHandler.execute({
        unitOfWork,
        categoryId: category.id,
        bookId: book.id,
      });

      const foundBookCategory = await bookCategoryRepository.findBookCategory({ id: bookCategory.id });

      expect(foundBookCategory).toBeNull();
    });
  });

  it('should throw if bookCategory with given id does not exist', async () => {
    expect.assertions(1);

    await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
      const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

      try {
        await deleteBookCategoryCommandHandler.execute({ unitOfWork, categoryId, bookId });
      } catch (error) {
        expect(error).toBeInstanceOf(BookCategoryNotFoundError);
      }
    });
  });
});
