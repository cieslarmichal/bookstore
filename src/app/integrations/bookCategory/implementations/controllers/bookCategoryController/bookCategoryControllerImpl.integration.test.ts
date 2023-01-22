import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

import { App } from '../../../../../app';
import { HttpServer } from '../../../../../../server/httpServer';
import { AddressModule } from '../../../../../domain/address/addressModule';
import { AuthorModule } from '../../../../../domain/author/authorModule';
import { AuthorBookModule } from '../../../../../domain/authorBook/authorBookModule';
import { BookModule } from '../../../../../domain/book/bookModule';
import { bookSymbols } from '../../../../../domain/book/bookSymbols';
import { BookFormat } from '../../../../../domain/book/contracts/bookFormat';
import { BookRepositoryFactory } from '../../../../../domain/book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../../../domain/book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryModule } from '../../../../../domain/bookCategory/bookCategoryModule';
import { bookCategorySymbols } from '../../../../../domain/bookCategory/bookCategorySymbols';
import { BookCategoryRepositoryFactory } from '../../../../../domain/bookCategory/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryEntityTestFactory } from '../../../../../domain/bookCategory/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { CategoryModule } from '../../../../../domain/category/categoryModule';
import { categorySymbols } from '../../../../../domain/category/categorySymbols';
import { CategoryRepositoryFactory } from '../../../../../domain/category/contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryEntityTestFactory } from '../../../../../domain/category/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerModule } from '../../../../../domain/customer/customerModule';
import { UserEntityTestFactory } from '../../../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../../../domain/user/userModule';
import { createDependencyInjectionContainer } from '../../../../../libs/dependencyInjection/container';
import { LoggerModule } from '../../../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../../../libs/logger/loggerModuleConfigTestFactory';
import { PostgresConnector } from '../../../../../libs/postgres/postgresConnector';
import { PostgresModule } from '../../../../../libs/postgres/postgresModule';
import { PostgresModuleConfigTestFactory } from '../../../../../libs/postgres/postgresModuleConfigTestFactory';
import { postgresSymbols } from '../../../../../libs/postgres/postgresSymbols';
import { UnitOfWorkModule } from '../../../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper } from '../../../../../tests/auth/authHelper';
import { SpyFactory } from '../../../../../tests/factories/spyFactory';
import { TestTransactionExternalRunner } from '../../../../../tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../../../integrationsModule';

const categoriesUrl = '/categories';
const booksUrl = '/books';

describe(`BookCategoryController ${categoriesUrl}, ${booksUrl}`, () => {
  const spyFactory = new SpyFactory(vi);

  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let server: HttpServer;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;
  let postgresConnector: PostgresConnector;

  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

  const loggerModuleConfig = new LoggerModuleConfigTestFactory().create();
  const postgresModuleConfig = new PostgresModuleConfigTestFactory().create();
  const userModuleConfig = new UserModuleConfigTestFactory().create();

  beforeEach(async () => {
    const container = await createDependencyInjectionContainer([
      new PostgresModule(postgresModuleConfig),
      new CategoryModule(),
      new BookModule(),
      new AuthorModule(),
      new BookCategoryModule(),
      new AuthorBookModule(),
      new UserModule(userModuleConfig),
      new IntegrationsModule(),
      new LoggerModule(loggerModuleConfig),
      new AddressModule(),
      new CustomerModule(),
      new UnitOfWorkModule(),
    ]);

    categoryRepositoryFactory = container.resolve(categorySymbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.resolve(bookSymbols.bookRepositoryFactory);
    bookCategoryRepositoryFactory = container.resolve(bookCategorySymbols.bookCategoryRepositoryFactory);
    postgresConnector = container.resolve(postgresSymbols.postgresConnector);

    testTransactionRunner = new TestTransactionExternalRunner(container);

    authHelper = new AuthHelper(spyFactory, container);

    const app = new App(container);

    server = new HttpServer(app.instance);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    postgresConnector.closeConnection();
  });

  describe('Create bookCategory', () => {
    it('returns bad request when categoryId or bookId are not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const categoryId = '123';
        const bookId = '123';

        const response = await request(server.instance)
          .post(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const response = await request(server.instance).post(`${booksUrl}/${bookId}/categories/${categoryId}`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns unprocessable entity when bookCategory with categoryId and bookId already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ name });

        await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .post(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.UNPROCESSABLE_ENTITY);
      });
    });

    it('returns not found when category or book corresponding to categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const response = await request(server.instance)
          .post(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ name });

        const response = await request(server.instance)
          .post(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });

  describe('Find category books', () => {
    it('returns bad request the categoryId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const categoryId = 'abc';

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${categoryId}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = categoryEntityTestFactory.create();

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${id}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ name });

        const response = await request(server.instance).get(`${categoriesUrl}/${category.id}/books`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns books matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, price } = bookEntityTestFactory.create();

        const book1 = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format: BookFormat.paperback,
          price,
        });

        const { title: otherTitle } = bookEntityTestFactory.create();

        const book2 = await bookRepository.createOne({
          title: otherTitle,
          releaseYear,
          language,
          format: BookFormat.hardcover,
          price,
        });

        const book3 = await bookRepository.createOne({
          title: otherTitle,
          releaseYear,
          language,
          format: BookFormat.kindle,
          price,
        });

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ name });

        await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book1.id });
        await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book2.id });
        await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book3.id });

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${category.id}/books?filter=["format||eq||paperback,hardcover"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response.body.data.books.length).toBe(2);
      });
    });
  });

  describe('Find categories of the book', () => {
    it('returns bad request the bookId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const bookId = 'abc';

        const response = await request(server.instance)
          .get(`${booksUrl}/${bookId}/categories`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { id } = bookEntityTestFactory.create();

        const response = await request(server.instance)
          .get(`${booksUrl}/${id}/categories`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).get(`${booksUrl}/${book.id}/categories`);

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('returns categories matchin filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, price, format } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { name } = categoryEntityTestFactory.create();

        const category1 = await categoryRepository.createOne({ name });

        const { name: otherName } = categoryEntityTestFactory.create();

        const category2 = await categoryRepository.createOne({ name: otherName });

        await bookCategoryRepository.createOne({ categoryId: category1.id, bookId: book.id });
        await bookCategoryRepository.createOne({ categoryId: category2.id, bookId: book.id });

        const response = await request(server.instance)
          .get(`${booksUrl}/${book.id}/categories?filter=["name||eq||${name}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(StatusCodes.OK);
        expect(response.body.data.categories.length).toBe(1);
      });
    });
  });

  describe('Remove bookCategory', () => {
    it('returns bad request when categoryId or bookId params are not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const categoryId = 'abc';
        const bookId = 'dfg';

        const response = await request(server.instance)
          .delete(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      });
    });

    it('returns not found when bookCategory with categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const response = await request(server.instance)
          .delete(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ name });

        await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${book.id}/categories/${category.id}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });

    it('accepts a request and returns no content when bookCategoryId is uuid and corresponds to existing bookCategory', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(spyFactory, async (unitOfWork) => {
        const { entityManager } = unitOfWork;

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const { title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const { name } = categoryEntityTestFactory.create();

        const category = await categoryRepository.createOne({ name });

        await bookCategoryRepository.createOne({ categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);
      });
    });
  });
});
