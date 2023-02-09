import 'reflect-metadata';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { HttpServer } from '../../../../server/httpServer';
import { HttpServerConfigTestFactory } from '../../../../server/tests/factories/httpServerConfigTestFactory/httpServerConfigTestFactory';
import { App } from '../../../app';
import { HttpStatusCode } from '../../../common/http/contracts/httpStatusCode';
import { AddressModule } from '../../../domain/address/addressModule';
import { AddressEntity } from '../../../domain/address/contracts/addressEntity';
import { AuthorModule } from '../../../domain/author/authorModule';
import { AuthorEntity } from '../../../domain/author/contracts/authorEntity';
import { AuthorBookModule } from '../../../domain/authorBook/authorBookModule';
import { AuthorBookEntity } from '../../../domain/authorBook/contracts/authorBookEntity';
import { BookModule } from '../../../domain/book/bookModule';
import { bookSymbols } from '../../../domain/book/bookSymbols';
import { BookEntity } from '../../../domain/book/contracts/bookEntity';
import { BookFormat } from '../../../domain/book/contracts/bookFormat';
import { BookRepositoryFactory } from '../../../domain/book/contracts/factories/bookRepositoryFactory/bookRepositoryFactory';
import { BookEntityTestFactory } from '../../../domain/book/tests/factories/bookEntityTestFactory/bookEntityTestFactory';
import { BookCategoryModule } from '../../../domain/bookCategory/bookCategoryModule';
import { bookCategorySymbols } from '../../../domain/bookCategory/bookCategorySymbols';
import { BookCategoryEntity } from '../../../domain/bookCategory/contracts/bookCategoryEntity';
import { BookCategoryRepositoryFactory } from '../../../domain/bookCategory/contracts/factories/bookCategoryRepositoryFactory/bookCategoryRepositoryFactory';
import { BookCategoryEntityTestFactory } from '../../../domain/bookCategory/tests/factories/bookCategoryEntityTestFactory/bookCategoryEntityTestFactory';
import { CategoryModule } from '../../../domain/category/categoryModule';
import { categorySymbols } from '../../../domain/category/categorySymbols';
import { CategoryEntity } from '../../../domain/category/contracts/categoryEntity';
import { CategoryRepositoryFactory } from '../../../domain/category/contracts/factories/categoryRepositoryFactory/categoryRepositoryFactory';
import { CategoryEntityTestFactory } from '../../../domain/category/tests/factories/categoryEntityTestFactory/categoryEntityTestFactory';
import { CustomerEntity } from '../../../domain/customer/contracts/customerEntity';
import { CustomerModule } from '../../../domain/customer/customerModule';
import { UserEntity } from '../../../domain/user/contracts/userEntity';
import { UserEntityTestFactory } from '../../../domain/user/tests/factories/userEntityTestFactory/userEntityTestFactory';
import { UserModuleConfigTestFactory } from '../../../domain/user/tests/factories/userModuleConfigTestFactory/userModuleConfigTestFactory';
import { UserModule } from '../../../domain/user/userModule';
import { DependencyInjectionContainerFactory } from '../../../libs/dependencyInjection/implementations/factories/dependencyInjectionContainerFactory/dependencyInjectionContainerFactory';
import { LoggerModule } from '../../../libs/logger/loggerModule';
import { LoggerModuleConfigTestFactory } from '../../../libs/logger/tests/factories/loggerModuleConfigTestFactory/loggerModuleConfigTestFactory';
import { PostgresModule } from '../../../libs/postgres/postgresModule';
import { postgresSymbols } from '../../../libs/postgres/postgresSymbols';
import { PostgresModuleConfigTestFactory } from '../../../libs/postgres/tests/factories/postgresModuleConfigTestFactory/postgresModuleConfigTestFactory';
import { UnitOfWorkModule } from '../../../libs/unitOfWork/unitOfWorkModule';
import { AuthHelper } from '../../common/tests/auth/authHelper';
import { TestTransactionExternalRunner } from '../../common/tests/unitOfWork/testTransactionExternalRunner';
import { IntegrationsModule } from '../../integrationsModule';

const categoriesUrl = '/categories';
const booksUrl = '/books';

describe(`BookCategoryController ${categoriesUrl}, ${booksUrl}`, () => {
  let bookCategoryRepositoryFactory: BookCategoryRepositoryFactory;
  let categoryRepositoryFactory: CategoryRepositoryFactory;
  let bookRepositoryFactory: BookRepositoryFactory;
  let server: HttpServer;
  let authHelper: AuthHelper;
  let testTransactionRunner: TestTransactionExternalRunner;
  let dataSource: DataSource;

  const bookCategoryEntityTestFactory = new BookCategoryEntityTestFactory();
  const categoryEntityTestFactory = new CategoryEntityTestFactory();
  const bookEntityTestFactory = new BookEntityTestFactory();
  const userEntityTestFactory = new UserEntityTestFactory();

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
  const userModuleConfig = new UserModuleConfigTestFactory().create();
  const httpServerConfig = new HttpServerConfigTestFactory().create();

  beforeEach(async () => {
    const container = await DependencyInjectionContainerFactory.create({
      modules: [
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
      ],
    });

    categoryRepositoryFactory = container.get<CategoryRepositoryFactory>(categorySymbols.categoryRepositoryFactory);
    bookRepositoryFactory = container.get<BookRepositoryFactory>(bookSymbols.bookRepositoryFactory);
    bookCategoryRepositoryFactory = container.get<BookCategoryRepositoryFactory>(
      bookCategorySymbols.bookCategoryRepositoryFactory,
    );
    dataSource = container.get<DataSource>(postgresSymbols.dataSource);

    await dataSource.initialize();

    testTransactionRunner = new TestTransactionExternalRunner(container);

    authHelper = new AuthHelper(container);

    const app = new App({ ...postgresModuleConfig, ...userModuleConfig, ...loggerModuleConfig });

    server = new HttpServer(app.instance, httpServerConfig);

    server.listen();
  });

  afterEach(async () => {
    server.close();

    dataSource.destroy();
  });

  describe('Create bookCategory', () => {
    it('returns bad request when categoryId or bookId are not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const categoryId = '123';

        const bookId = '123';

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const response = await request(server.instance).post(`${booksUrl}/${bookId}/categories/${categoryId}`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns unprocessable entity when bookCategory with categoryId and bookId already exists', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const { id } = bookCategoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const book = await bookRepository.createOne(bookEntity);

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id, categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .post(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.unprocessableEntity);
      });
    });

    it('returns not found when category or book corresponding to categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .post(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns created when all required params are provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const book = await bookRepository.createOne(bookEntity);

        const category = await categoryRepository.createOne(categoryEntity);

        const response = await request(server.instance)
          .post(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.created);
      });
    });
  });

  describe('Find category books', () => {
    it('returns bad request the categoryId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const categoryId = 'abc';

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${categoryId}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when category with given categoryId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = categoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${id}/books`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const { id, name } = categoryEntityTestFactory.create();

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const category = await categoryRepository.createOne({ id, name });

        const response = await request(server.instance).get(`${categoriesUrl}/${category.id}/books`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns books matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity1 = bookEntityTestFactory.create({ format: BookFormat.paperback });

        const bookEntity2 = bookEntityTestFactory.create({ format: BookFormat.hardcover });

        const bookEntity3 = bookEntityTestFactory.create({ format: BookFormat.kindle });

        const categoryEntity = categoryEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId3 } = bookCategoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const book1 = await bookRepository.createOne(bookEntity1);

        const book2 = await bookRepository.createOne(bookEntity2);

        const book3 = await bookRepository.createOne(bookEntity3);

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id: bookCategoryId1, categoryId: category.id, bookId: book1.id });

        await bookCategoryRepository.createOne({ id: bookCategoryId2, categoryId: category.id, bookId: book2.id });

        await bookCategoryRepository.createOne({ id: bookCategoryId3, categoryId: category.id, bookId: book3.id });

        const response = await request(server.instance)
          .get(`${categoriesUrl}/${category.id}/books?filter=["format||eq||paperback,hardcover"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.books.length).toBe(2);
      });
    });
  });

  describe('Find categories of the book', () => {
    it('returns bad request the bookId param is not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const bookId = 'abc';

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .get(`${booksUrl}/${bookId}/categories`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when book with given bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { id } = bookEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .get(`${booksUrl}/${id}/categories`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const { id, title, releaseYear, language, format, price } = bookEntityTestFactory.create();

        const book = await bookRepository.createOne({
          id,
          title,
          releaseYear,
          language,
          format,
          price,
        });

        const response = await request(server.instance).get(`${booksUrl}/${book.id}/categories`);

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('returns categories matching filter criteria', async () => {
      expect.assertions(2);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity1 = categoryEntityTestFactory.create();

        const categoryEntity2 = categoryEntityTestFactory.create();

        const { id: bookCategoryId1 } = bookCategoryEntityTestFactory.create();

        const { id: bookCategoryId2 } = bookCategoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const book = await bookRepository.createOne(bookEntity);

        const category1 = await categoryRepository.createOne(categoryEntity1);

        const category2 = await categoryRepository.createOne(categoryEntity2);

        await bookCategoryRepository.createOne({ id: bookCategoryId1, categoryId: category1.id, bookId: book.id });

        await bookCategoryRepository.createOne({ id: bookCategoryId2, categoryId: category2.id, bookId: book.id });

        const response = await request(server.instance)
          .get(`${booksUrl}/${book.id}/categories?filter=["name||eq||${categoryEntity1.name}"]`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(HttpStatusCode.ok);
        expect(response.body.data.categories.length).toBe(1);
      });
    });
  });

  describe('Delete bookCategory', () => {
    it('returns bad request when categoryId or bookId params are not uuid', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const categoryId = 'abc';

        const bookId = 'dfg';

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.badRequest);
      });
    });

    it('returns not found when bookCategory with categoryId and bookId does not exist', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async () => {
        const { id: userId, role } = userEntityTestFactory.create();

        const { categoryId, bookId } = bookCategoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${bookId}/categories/${categoryId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.notFound);
      });
    });

    it('returns unauthorized when access token is not provided', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const { id: bookCategoryId } = bookCategoryEntityTestFactory.create();

        const book = await bookRepository.createOne(bookEntity);

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id: bookCategoryId, categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${book.id}/categories/${category.id}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.unauthorized);
      });
    });

    it('accepts a request and returns no content when bookCategoryId is uuid and corresponds to existing bookCategory', async () => {
      expect.assertions(1);

      await testTransactionRunner.runInTestTransaction(async (unitOfWork) => {
        const entityManager = unitOfWork.getEntityManager();

        const bookRepository = bookRepositoryFactory.create(entityManager);

        const categoryRepository = categoryRepositoryFactory.create(entityManager);

        const bookCategoryRepository = bookCategoryRepositoryFactory.create(entityManager);

        const { id: userId, role } = userEntityTestFactory.create();

        const bookEntity = bookEntityTestFactory.create();

        const categoryEntity = categoryEntityTestFactory.create();

        const { id: bookCategoryId } = bookCategoryEntityTestFactory.create();

        const accessToken = authHelper.mockAuth({ userId, role });

        const book = await bookRepository.createOne(bookEntity);

        const category = await categoryRepository.createOne(categoryEntity);

        await bookCategoryRepository.createOne({ id: bookCategoryId, categoryId: category.id, bookId: book.id });

        const response = await request(server.instance)
          .delete(`${booksUrl}/${book.id}/categories/${category.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send();

        expect(response.statusCode).toBe(HttpStatusCode.noContent);
      });
    });
  });
});
