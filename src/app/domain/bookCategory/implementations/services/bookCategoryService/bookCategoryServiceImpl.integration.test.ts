import { describe, it, beforeAll, afterAll, expect } from 'vitest';

import { ConfigLoader } from '../../../../../../configLoader';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { postgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { TestTransactionInternalRunner } from '../../../../../tests/unitOfWork/testTransactionInternalRunner';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryModule } from '../../../../category/categoryModule';
import { categorySymbols } from '../../../../category/categorySymbols';
import { CategoryRepositoryFactory } from '../../../../category/contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryEntityTestFactory } from '../../../../category/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { BookCategoryModule } from '../../../bookCategoryModule';
import { bookCategorySymbols } from '../../../bookCategorySymbols';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryService } from '../../../contracts/services/bookCategoryService/bookCategoryService';
import { BookCategoryAlreadyExistsError } from '../../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';
import { BookCategoryEntityTestFactory } from '../../../tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';

describe('BookCategoryService', () => {
  let bookCategoryService: BookCategoryService;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let bookCategoryEntityTestFactory: BookCategoryEntityTestFactory;
  let categoryEntityTestFactory: CategoryEntityTestFactory;
  let bookEntityTestFactory: BookEntityTestFactory;
  let testTransactionRunner: TestTransactionInternalRunner;

  beforeAll(async () => {
    ConfigLoader.loadConfig();

    const container = await createDependencyInjectionContainer([
      PostgresModule,
      CategoryModule,
      BookModule,
      BookCategoryModule,
      LoggerModule,
      UnitOfWorkModule,
    ]);

    bookCategoryService = container.resolve(bookCategorySymbols.bookCategoryService);
    bookCategoryRepositoryFactory = container.resolve(bookCategorySymbols.bookCategoryRepositoryFactory);
    categoryRepositoryFactory = container.resolve(categorySymbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);

    testTransactionRunner = new TestTransactionInternalRunner(container);

    bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
    categoryEntityTestFactory = new CategoryEntityTestFactory();
    bookEntityTestFactory = new BookEntityTestFactory();
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create bookCategory', () => {
    it('creates bookCategory in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const createdBookCategoryDto = await bookCategoryService.createBookCategory(unitOfWork, {
          categoryId: category.id,
          bookId: book.id,
        });

        const bookCategoryDto = await bookCategoryRepository.findOneById(createdBookCategoryDto.id);

        expect(bookCategoryDto).not.toBeNull();
      });
    });

    it('should not create bookCategory and throw if bookCategory with the same bookId and categoryId exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        await bookCategoryService.createBookCategory(unitOfWork, {
          categoryId: category.id,
          bookId: book.id,
        });

        try {
          await bookCategoryService.createBookCategory(unitOfWork, {
            categoryId: category.id,
            bookId: book.id,
          });
        } catch (error) {
          expect(error).toBeInstanceOf(BookCategoryAlreadyExistsError);
        }
      });
    });
  });

  describe('Remove bookCategory', () => {
    it('removes bookCategory from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { entityManager } = unitOfWork;
        const categoryRepository = categoryRepositoryFactory.create(entityManager);
        const bookRepository = bookRepositoryFactory.create(entityManager);
        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({
          name,
        });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const bookCategory = await bookCategoryRepository.createOne({
          categoryId: category.id,
          bookId: book.id,
        });

        await bookCategoryService.removeBookCategory(unitOfWork, { categoryId: category.id, bookId: book.id });

        const bookCategoryDto = await bookCategoryRepository.findOneById(bookCategory.id);

        expect(bookCategoryDto).toBeNull();
      });
    });

    it('should throw if bookCategory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        try {
          await bookCategoryService.removeBookCategory(unitOfWork, { categoryId, bookId });
        } catch (error) {
          expect(error).toBeInstanceOf(BookCategoryNotFoundError);
        }
      });
    });
  });
});
