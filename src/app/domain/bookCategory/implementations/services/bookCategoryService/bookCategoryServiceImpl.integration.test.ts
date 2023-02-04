import 'reflect-metadata';

import { describe, it, beforeAll, afterAll, expect, vi } from 'vitest';

import { SpyFactory } from '../../../../../common/tests/implementations/spyFactory';
import { TestTransactionInternalRunner } from '../../../../../integrations/common/tests/unitOfWork/testTransactionInternalRunner';
import { DependencyInjectionContainerFactory } from '../../../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/contracts/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AddressEntity } from '../../../../address/contracts/addressEntity';
import { AuthorEntity } from '../../../../author/contracts/authorEntity';
import { AuthorBookEntity } from '../../../../authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../../book/bookModule';
import { bookSymbols } from '../../../../book/bookSymbols';
import { BookEntity } from '../../../../book/contracts/bookEntity';
import { BookRepositoryFactory } from '../../../../book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { CategoryModule } from '../../../../category/categoryModule';
import { categorySymbols } from '../../../../category/categorySymbols';
import { CategoryEntity } from '../../../../category/contracts/categoryEntity';
import { CategoryRepositoryFactory } from '../../../../category/contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryEntityTestFactory } from '../../../../category/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerEntity } from '../../../../customer/contracts/customerEntity';
import { UserEntity } from '../../../../user/contracts/userEntity';
import { BookCategoryModule } from '../../../bookCategoryModule';
import { bookCategorySymbols } from '../../../bookCategorySymbols';
import { BookCategoryEntity } from '../../../contracts/bookCategoryEntity';
import { BookCategoryRepositoryFactory } from '../../../contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryService } from '../../../contracts/services/bookCategoryService/bookCategoryService';
import { BookCategoryAlreadyExistsError } from '../../../errors/bookCategoryAlreadyExistsError';
import { BookCategoryNotFoundError } from '../../../errors/bookCategoryNotFoundError';
import { BookCategoryEntityTestFactory } from '../../../tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';

describe('BookCategoryService', () => {
  const spyFactory = new SpyFactory(vi);

  let bookCategoryService: BookCategoryService;
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let testTransactionRunner: TestTransactionInternalRunner;
  let postgresConnector: PostgresConnector;

  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create({
    entities: [
      BookEntity,
      AuthorEntity,
      UserEntity,
      CategoryEntity,
      AuthorBookEntity,
      BookCategoryEntity,
      AddressEntity,
      CustomerEntity,
    ],
  });

  beforeAll(async () => {
    const container = await DependencyInjectionContainerFactory.create([
      new PostgresModule(postgresModuleConfig),
      new CategoryModule(),
      new BookModule(),
      new BookCategoryModule(),
      new LoggerModule(loggerModuleConfig),
      new UnitOfWorkModule(),
    ]);

    bookCategoryService = container.resolve(bookCategorySymbols.bookCategoryService);
    bookCategoryRepositoryFactory = container.resolve(bookCategorySymbols.bookCategoryRepositoryFactory);
    categoryRepositoryFactory = container.resolve(categorySymbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionInternalRunner(container);
  });

  afterAll(async () => {
    postgresConnector.closeConnection();
  });

  describe('Create bookCategory', () => {
    it('creates bookCategory in database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const categoryEntity = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const category = await categoryRepository.createOne(categoryEntity);

        const book = await bookRepository.createOne(bookEntity);

        const bookCategory = await bookCategoryService.createBookCategory({
          unitOfWork,
          draft: {
            categoryId: category.id,
            bookId: book.id,
          },
        });

        const foundBookCategory = await bookCategoryRepository.findOne({ id: bookCategory.id });

        expect(foundBookCategory).not.toBeNull();
      });
    });

    it('should not create bookCategory and throw if bookCategory with the same bookId and categoryId exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryEntity = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const category = await categoryRepository.createOne(categoryEntity);

        const book = await bookRepository.createOne(bookEntity);

        await bookCategoryService.createBookCategory({
          unitOfWork,
          draft: {
            categoryId: category.id,
            bookId: book.id,
          },
        });

        try {
          await bookCategoryService.createBookCategory({
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

  describe('Delete bookCategory', () => {
    it('deletes bookCategory from database', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const categoryEntity = categoryEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const { id: bookCategoryId } = bookCategoryEntityTestFactory.create();

        const category = await categoryRepository.createOne(categoryEntity);

        const book = await bookRepository.createOne(bookEntity);

        const bookCategory = await bookCategoryRepository.createOne({
          id: bookCategoryId,
          categoryId: category.id,
          bookId: book.id,
        });

        await bookCategoryService.deleteBookCategory({ unitOfWork, categoryId: category.id, bookId: book.id });

        const foundBookCategory = await bookCategoryRepository.findOne({ id: bookCategory.id });

        expect(foundBookCategory).toBeNull();
      });
    });

    it('should throw if bookCategory with given id does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        try {
          await bookCategoryService.deleteBookCategory({ unitOfWork, categoryId, bookId });
        } catch (error) {
          expect(error).toBeInstanceOf(BookCategoryNotFoundError);
        }
      });
    });
  });
});
